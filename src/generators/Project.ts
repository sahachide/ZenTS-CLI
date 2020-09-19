import AbstractGenerator from '../classes/AbstractGenerator'
import type { PackageJson } from 'type-fest'
import readPackageJsonInfo from 'package-json'

interface Answers {
  name: string
  description: string
  version: string
  homepage: string
  author: string
  repository: string
  license: string
  packageManager: string
  dbPackage: string
  extras: string[]
  eslintRules: {
    rules: string[]
    install?: string[]
  }[]
}

enum EXTRA {
  ESLINT = 'eslint',
}

export default class Project extends AbstractGenerator {
  private answers!: Answers
  private isDev: boolean
  constructor(args: any, options: any) {
    super(args, options)

    this.isDev = this.options.dev as boolean
  }
  public async prompting() {
    const projectname = this.options.projectname as string
    const username = this.user.git.name() ?? 'johndoe'
    const homepage = `https://github.com/${username}/${projectname}`
    this.answers = await this.prompt<Answers>([
      {
        type: 'input',
        name: 'name',
        message: 'package name',
        default: projectname,
      },
      {
        type: 'input',
        name: 'description',
        message: 'package description',
        default: 'My ZenTS project',
      },
      {
        type: 'input',
        name: 'version',
        message: 'version',
        default: '1.0.0',
      },
      {
        type: 'input',
        name: 'homepage',
        message: 'homepage',
        default: homepage,
      },
      {
        type: 'input',
        name: 'author',
        default: username,
      },
      {
        type: 'input',
        name: 'repository',
        message: 'repository url',
        default: homepage,
      },
      {
        type: 'input',
        name: 'license',
        default: 'MIT',
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'package manager',
        default: 'npm',
        choices: ['npm', 'yarn'],
      },
      {
        type: 'list',
        name: 'dbPackage',
        message: 'database driver',
        choices: [
          {
            name: 'None (can be installed later)',
            short: 'None',
            value: 'none',
          },
          {
            name: 'MySQL / MariaDB (mysql variant)',
            short: 'MySQL / MariaDB',
            value: 'mysql',
          },
          {
            name: 'MySQL / MariaDB (mysql2 variant)',
            short: 'MySQL / MariaDB',
            value: 'mysql2',
          },
          {
            name: 'PostgreSQL / CockroachDB',
            value: 'pg',
          },
          {
            name: 'SQLite',
            value: 'sqlite3',
          },
          {
            name: 'Microsoft SQL Server',
            short: 'MSSQL',
            value: 'mssql',
          },
          {
            name: 'Oracle',
            value: 'oracledb',
          },
          {
            name: 'MongoDB (experimental)',
            short: 'MongoDB',
            value: 'mongodb',
          },
        ],
      },
      {
        type: 'checkbox',
        name: 'extras',
        message: '3rd party tools (can also be installed later)?',
        choices: [
          {
            name: 'ESLint',
            value: EXTRA.ESLINT,
          },
        ],
      },
      {
        type: 'checkbox',
        name: 'eslintRules',
        message: 'choose ESLint ruleset(s)',
        when: (answers: Answers) => answers.extras.includes(EXTRA.ESLINT),
        choices: [
          {
            name: 'Recommended',
            value: {
              rules: [
                'eslint:recommended',
                'plugin:@typescript-eslint/eslint-recommended',
                'plugin:@typescript-eslint/recommended',
              ],
            },
            checked: true,
          },
          {
            name: 'Airbnb',
            value: {
              rules: ['plugin:airbnb-typescript'],
              install: [
                'eslint-config-airbnb-typescript',
                'eslint-plugin-import',
                'eslint-plugin-jsx-a11y',
                'eslint-plugin-react',
                'eslint-plugin-react-hooks',
              ],
            },
          },
          {
            name: 'Alloy',
            value: {
              rules: ['plugin:alloy'],
              install: ['eslint-config-alloy', 'babel-eslint '],
            },
          },
          {
            name: 'Facebook',
            value: {
              rules: ['plugin:fbjs'],
              install: [
                'eslint-config-fbjs',
                'eslint-plugin-babel',
                'eslint-plugin-flowtype',
                'eslint-plugin-jsx-a11y',
                'eslint-plugin-react',
                'babel-eslint',
              ],
            },
          },
          {
            name: 'Google',
            value: {
              rules: ['plugin:google'],
              install: ['eslint-config-google'],
            },
          },
          {
            name: 'Prettier',
            value: {
              rules: ['plugin:prettier/recommended'],
              install: ['eslint-config-prettier'],
            },
          },
          {
            name: 'Shopify',
            value: {
              rules: ['plugin:@shopify/esnext'],
              install: ['@shopify/eslint-plugin'],
            },
          },
        ],
      },
    ])
  }
  public async writing() {
    this.copyDestination(this.templatePath('project'), this.destinationPath())
    this.fs.writeJSON(this.destinationPath('./package.json'), await this._generatePackageJson())
    this.fs.writeJSON(this.destinationPath('./tsconfig.json'), this._generateTSConfigJson())

    if (this.answers.extras.includes(EXTRA.ESLINT)) {
      const extendRules = this._getEslintExtendRules()

      this.fs.copyTpl(
        this.templatePath('eslint', '.eslintrc.js'),
        this.destinationPath('.eslintrc.js'),
        { extendRules },
      )
    }
  }
  public install() {
    this.log('INSTALL')
    if (this.isDev) {
      this.spawnCommandSync('yalc', ['add', 'zents'])
    }

    this.installDependencies({
      npm: this.answers.packageManager === 'npm',
      bower: false,
      yarn: this.answers.packageManager === 'yarn',
    })
  }
  private _generateTSConfigJson() {
    return {
      compilerOptions: {
        target: 'es2019',
        module: 'commonjs',
        lib: ['es2020'],
        alwaysStrict: true,
        esModuleInterop: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        forceConsistentCasingInFileNames: true,
        incremental: true,
        noImplicitAny: true,
        moduleResolution: 'node',
        outDir: './dist/',
        sourceMap: true,
        declaration: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'src/view/**/*'],
    }
  }
  private async _generatePackageJson() {
    const packageJson: PackageJson = {
      name: this.answers.name,
      description: this.answers.description,
      version: this.answers.version,
      author: this.answers.author,
      license: this.answers.license,
      main: './dist/app.js',
      types: './dist/app.d.ts',
      scripts: {
        build: 'tsc',
        watch: 'tsc --watch',
        start: 'ts-node src/app.ts',
      },
      devDependencies: {
        '@types/node': '^14.0.27',
        'ts-node': '^9.0.0',
        'typescript': '^3.9.7',
      },
      dependencies: {
        typeorm: '^0.2.25',
      },
    }

    // make TS happy :)
    if (typeof packageJson.dependencies === 'undefined') {
      packageJson.dependencies = {}
    }
    if (typeof packageJson.devDependencies === 'undefined') {
      packageJson.devDependencies = {}
    }

    if (!this.isDev) {
      packageJson.dependencies.zents = await this._getPackageVersion('zents')
    }

    if (this.answers.dbPackage !== 'none') {
      try {
        packageJson.dependencies[this.answers.dbPackage] = await this._getPackageVersion(
          this.answers.dbPackage,
        )
      } catch (e) {
        this.log('Error while installing database driver:')
        this.log(e)
      }
    }

    if (this.answers.extras.includes(EXTRA.ESLINT)) {
      const standardEslintPackages = [
        'eslint',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
      ]

      for (const standardEslintPackage of standardEslintPackages) {
        try {
          packageJson.devDependencies[standardEslintPackage] = await this._getPackageVersion(
            standardEslintPackage,
          )
        } catch (e) {
          this.log('Error while installing eslint:')
          this.log(e)
        }
      }

      for (const eslintRule of this.answers.eslintRules) {
        if (Array.isArray(eslintRule.install)) {
          for (const devDependency of eslintRule.install) {
            try {
              packageJson.devDependencies[devDependency] = await this._getPackageVersion(
                devDependency,
              )
            } catch (e) {
              this.log('Error while installing eslint config plugin:')
              this.log(e)
            }
          }
        }
      }
    }

    return packageJson
  }
  private async _getPackageVersion(packageName: string): Promise<string> {
    const packageInfo = await readPackageJsonInfo(packageName)

    return (packageInfo.version as string) ?? '1.0.0'
  }
  private _getEslintExtendRules() {
    let rules: string[] = []

    for (const eslintRule of this.answers.eslintRules) {
      rules = [...rules, ...eslintRule.rules]
    }

    return rules
  }
}
