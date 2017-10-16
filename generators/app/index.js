const util = require('util');
const chalk = require('chalk');
const generator = require('yeoman-generator');
const packagejs = require('../../package.json');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

const _ = require('lodash');
const pluralize = require('pluralize');
const fs = require('fs');
const cheerio = require('cheerio');

const CLIENT_MAIN_SRC_DIR = jhipsterConstants.CLIENT_MAIN_SRC_DIR;

const JhipsterGenerator = generator.extend({});
util.inherits(JhipsterGenerator, BaseGenerator);

module.exports = JhipsterGenerator.extend({

    /* Helper methods */
    _addToModuleDef(fileContent, moduleName) {
        if (fileContent.indexOf(`import { ${moduleName} } from 'primeng/primeng';`) < 0) {
            fileContent = fileContent.replace(/(Module \} from '..\/..\/shared';)/gi, `$1\nimport { ${moduleName} } from 'primeng/primeng';`);
        }

        if (fileContent.indexOf(`${moduleName},`) < 0) {
            fileContent = fileContent.replace(/(.*RouterModule.forRoot\(ENTITY_STATES)/gi, `        ${moduleName},\n$1`);
        }
        return fileContent;
    },
    /* End of helper methods */

    initializing: {
        readConfig() {
            this.jhipsterAppConfig = this.getJhipsterAppConfig();
            if (!this.jhipsterAppConfig) {
                this.error('Can\'t read .yo-rc.json');
            }
        },
        displayLogo() {
            // Have Yeoman greet the user.
            this.log('');
            this.log(`${chalk.red('██████╗ ██████╗ ██╗███╗   ███╗███████╗███╗   ██╗ ██████╗     ███████╗███╗   ██╗████████╗██╗████████╗██╗   ██╗')}`);
            this.log(`${chalk.red('██╔══██╗██╔══██╗██║████╗ ████║██╔════╝████╗  ██║██╔════╝     ██╔════╝████╗  ██║╚══██╔══╝██║╚══██╔══╝╚██╗ ██╔╝')}`);
            this.log(`${chalk.red('██████╔╝██████╔╝██║██╔████╔██║█████╗  ██╔██╗ ██║██║  ███╗    █████╗  ██╔██╗ ██║   ██║   ██║   ██║    ╚████╔╝ ')}`);
            this.log(`${chalk.red('██╔═══╝ ██╔══██╗██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║██║   ██║    ██╔══╝  ██║╚██╗██║   ██║   ██║   ██║     ╚██╔╝ ')}`);
            this.log(`${chalk.red('██║     ██║  ██║██║██║ ╚═╝ ██║███████╗██║ ╚████║╚██████╔╝    ███████╗██║ ╚████║   ██║   ██║   ██║      ██║')}`);
            this.log(`${chalk.red('╚═╝     ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝   ╚═╝      ╚═╝')}`);

            this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster primeng-entity')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
        },
        checkJhipster() {
            const jhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
            const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
            if (!semver.satisfies(jhipsterVersion, minimumJhipsterVersion)) {
                this.warning(`\nYour generated project used an old JHipster version (${jhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`);
            }
        }
    },

    prompting() {
        const prompts = [{
            type: 'confirm',
            name: 'confirmation',
            message: 'This generator will update entity related pages to use Primeng components. Are you sure?',
            default: true
        }];

        const done = this.async();
        this.prompt(prompts).then((props) => {
            this.props = props;
            if (!this.props.confirmation) {
                this.env.error(chalk.green('Aborting, no changes were made.'));
            }
            done();
        });
    },

    writing: {
        updateBase() {
            // function to use directly template
            this.template = function (source, destination) {
                this.fs.copyTpl(
                    this.templatePath(source),
                    this.destinationPath(destination),
                    this
                );
            };

            // read config from .yo-rc.json
            this.baseName = this.jhipsterAppConfig.baseName;
            this.packageName = this.jhipsterAppConfig.packageName;
            this.packageFolder = this.jhipsterAppConfig.packageFolder;
            this.clientFramework = this.jhipsterAppConfig.clientFramework;
            this.clientPackageManager = this.jhipsterAppConfig.clientPackageManager;
            this.buildTool = this.jhipsterAppConfig.buildTool;
            this.useSass = this.jhipsterAppConfig.useSass;
            this.databaseType = this.jhipsterAppConfig.databaseType;

            // use function in generator-base.js from generator-jhipster
            this.angularAppName = this.getAngularAppName();

            if (this.clientFramework === 'angularX') {
                // add dependencies
                try {
                    this.addNpmDependency('@angular/animations', '^4.3.0');
                    this.addNpmDependency('primeng', '^4.2.1');
                    this.addNpmDependency('font-awesome', '4.7.0');
                } catch (e) {
                    this.log(`${chalk.red.bold('ERROR!')}`);
                    this.log('  Problem when adding the new librairies in your package.json');
                    this.log('  You need to add manually:\n');
                    this.log('  "@angular/animations": "^4.3.0",');
                    this.log('  "primeng": "^4.2.1",');
                    this.log('  "font-awesome": "4.7.0"');
                    this.log('');
                    this.anyError = true;
                }

                // add animations to import
                try {
                    const importStmt = 'import {BrowserAnimationsModule} from \'@angular/platform-browser/animations\';';
                    this.rewriteFile(
                        'src/main/webapp/app/app.module.ts',
                        'jhipster-needle-angular-add-module-import',
                        `${importStmt}`);
                } catch (e) {
                    this.log(`${chalk.red.bold('Error adding browser animations to app.module.ts (1)')}`);
                }

                try {
                    this.rewriteFile(
                        'src/main/webapp/app/app.module.ts',
                        'jhipster-needle-angular-add-module',
                        'BrowserAnimationsModule,');
                } catch (e) {
                    this.log(`${chalk.red.bold('Error adding browser animations to app.module.ts (2)')}`);
                }

                const vendorFile = `src/main/webapp/content/${(this.useSass ? 'scss/vendor.scss' : 'css/vendor.css')}`;
                let fileContent = fs.readFileSync(vendorFile, 'utf8');
                if (fileContent.indexOf('primeng.min.css') < 0) {
                    fileContent += this.stripMargin(`|@import '~primeng/resources/primeng.min.css';
                                             |@import '~primeng/resources/themes/bootstrap/theme.css';`);
                }
                fs.writeFileSync(vendorFile, fileContent);
            } else {
                this.log('Primeng-entity generator only works for angular2/4 applications.');
            }
        },

        updateEntityFiles() {
            this.existingEntities = this.getExistingEntities();

            if (this.existingEntities && this.existingEntities.length > 0 && this.existingEntities !== 'none') {
                this.existingEntities.forEach(function (entity) {
                    const entityNameSpinalCased = _.kebabCase(_.lowerFirst(entity.name));
                    const entityNamePluralizedAndSpinalCased = _.kebabCase(_.lowerFirst(pluralize(entity.name)));

                    this.entityNameCapitalized = _.upperFirst(entity.name);
                    this.entityClass = this.entityNameCapitalized;
                    this.entityClassHumanized = _.startCase(this.entityNameCapitalized);
                    this.entityClassPlural = pluralize(this.entityClass);
                    this.entityClassPluralHumanized = _.startCase(this.entityClassPlural);
                    this.entityInstance = _.lowerFirst(this.name);
                    this.entityInstancePlural = pluralize(this.entityInstance);
                    this.entityApiUrl = entityNamePluralizedAndSpinalCased;
                    this.entityFolderName = entityNameSpinalCased;
                    this.entityFileName = _.kebabCase(this.entityNameCapitalized + _.upperFirst(this.entityAngularJSSuffix));
                    this.entityPluralFileName = entityNamePluralizedAndSpinalCased + this.entityAngularJSSuffix;
                    this.entityServiceFileName = this.entityFileName;
                    this.entityAngularName = this.entityClass + _.upperFirst(_.camelCase(this.entityAngularJSSuffix));
                    this.entityStateName = _.kebabCase(this.entityAngularName);
                    this.entityUrl = this.entityStateName;
                    this.entityTranslationKey = this.entityInstance;
                    this.entityTranslationKeyMenu = _.camelCase(this.entityStateName);

                    this.fieldsContainInstant = false;
                    this.fieldsContainZonedDateTime = false;
                    this.fieldsContainLocalDate = false;
                    this.fieldsContainBigDecimal = false;
                    this.fieldsContainBlob = false;
                    this.fieldsContainImageBlob = false;
                    this.fieldsContainNumber = false;
                    this.fieldsContainText = false;
                    this.fieldsContainBoolean = false;
                    this.fieldsContainEnum = false;
                    this.validation = false;
                    this.fieldsContainOwnerManyToMany = false;
                    this.fieldsContainNoOwnerOneToOne = false;
                    this.fieldsContainOwnerOneToOne = false;
                    this.fieldsContainOneToMany = false;
                    this.fieldsContainManyToOne = false;
                    this.differentTypes = [this.entityClass];

                    this.fields = entity.definition.fields || [];

                    this.enumFields = [];
                    this.enumValueArrDef = '';

                    // Load in-memory data for fields
                    this.fields.forEach((field) => {
                        // Migration from JodaTime to Java Time
                        if (field.fieldType === 'DateTime' || field.fieldType === 'Date') {
                            field.fieldType = 'Instant';
                        }
                        const fieldType = field.fieldType;

                        const nonEnumType = _.includes(['String', 'Integer', 'Long', 'Float', 'Double', 'BigDecimal',
                            'LocalDate', 'Instant', 'ZonedDateTime', 'Boolean', 'byte[]', 'ByteBuffer'
                        ], fieldType);
                        if ((this.databaseType === 'sql' || this.databaseType === 'mongodb') && !nonEnumType) {
                            field.fieldIsEnum = true;
                        } else {
                            field.fieldIsEnum = false;
                        }

                        if (_.isUndefined(field.fieldNameCapitalized)) {
                            field.fieldNameCapitalized = _.upperFirst(field.fieldName);
                        }

                        if (_.isUndefined(field.fieldNameUnderscored)) {
                            field.fieldNameUnderscored = _.snakeCase(field.fieldName);
                        }

                        if (fieldType === 'ZonedDateTime') {
                            this.fieldsContainZonedDateTime = true;
                        } else if (fieldType === 'Instant') {
                            this.fieldsContainInstant = true;
                        } else if (fieldType === 'LocalDate') {
                            this.fieldsContainLocalDate = true;
                        } else if (fieldType === 'BigDecimal') {
                            this.fieldsContainBigDecimal = true;
                            this.fieldsContainNumber = true;
                        } else if (fieldType === 'Boolean') {
                            this.fieldsContainBoolean = true;
                        } else if (fieldType === 'String') {
                            this.fieldsContainText = true;
                        } else if (fieldType === 'Long' || fieldType === 'Integer' ||
                            fieldType === 'Double' || fieldType === 'Float') {
                            this.fieldsContainNumber = true;
                        } else if (fieldType === 'byte[]' || fieldType === 'ByteBuffer') {
                            this.fieldsContainBlob = true;
                            if (field.fieldTypeBlobContent === 'image') {
                                this.fieldsContainImageBlob = true;
                            }
                        }

                        if (field.fieldIsEnum) {
                            this.fieldsContainEnum = true;
                            this.enumFields.push(field.fieldName);

                            const items = [];
                            const values = field.fieldValues.split(',');
                            values.forEach((v) => {
                                items.push({
                                    label: v,
                                    value: v
                                });
                            });
                            const enumArrName = _.camelCase(`${field.fieldName}ValueArr`);
                            this.enumValueArrDef += `    ${enumArrName}: any[] = \n${JSON.stringify(items, null, 4).replace(/"/g, '\'').replace(/^/gm, '        ')};\n`;
                        }

                        if (field.fieldValidate) {
                            this.validation = true;
                        }
                    });

                    // update entity's module file
                    const moduleFilePath = `${CLIENT_MAIN_SRC_DIR}app/entities/${this.entityFolderName}/${this.entityFileName}.module.ts`;
                    let fileContent = fs.readFileSync(moduleFilePath, 'utf8');

                    if (this.fieldsContainNumber) {
                        fileContent = this._addToModuleDef(fileContent, 'SpinnerModule');
                    }

                    if (this.fieldsContainText) {
                        fileContent = this._addToModuleDef(fileContent, 'InputTextModule');
                    }

                    if (this.fieldsContainBoolean) {
                        fileContent = this._addToModuleDef(fileContent, 'CheckboxModule');
                    }

                    if (this.fieldsContainLocalDate || this.fieldsContainInstant || this.fieldsContainZonedDateTime) {
                        fileContent = this._addToModuleDef(fileContent, 'CalendarModule');
                    }

                    if (this.fieldsContainEnum) {
                        fileContent = this._addToModuleDef(fileContent, 'DropdownModule');
                    }
                    fs.writeFileSync(moduleFilePath, fileContent);

                    // update dialog.component.ts for enum value arrays
                    if (this.fieldsContainEnum) {
                        const dialogComponentFilePath = `${CLIENT_MAIN_SRC_DIR}app/entities/${this.entityFolderName}/${this.entityFileName}-dialog.component.ts`;
                        let dialogFileContent = fs.readFileSync(dialogComponentFilePath, 'utf8');

                        if (dialogFileContent.indexOf(this.enumValueArrDef) < 0) {
                            dialogFileContent = dialogFileContent.replace(/(implements OnInit {\n)/gi, `$1\n${this.enumValueArrDef}`);
                        }

                        fs.writeFileSync(dialogComponentFilePath, dialogFileContent);
                    }

                    // update entity's dialog html file
                    const htmlFilePath = `${CLIENT_MAIN_SRC_DIR}app/entities/${this.entityFolderName}/${this.entityFileName}-dialog.component.html`;
                    let htmlContent = this.fs.read(htmlFilePath);
                    const $ = cheerio.load(htmlContent, {
                        decodeEntities: false,
                        lowerCaseAttributeNames: false
                    });

                    const self = this;
                    if (this.fieldsContainNumber) {
                        $('input[type=number]').each(function () {
                            const name = $(this).attr('name');
                            const id = $(this).attr('id');
                            const ngModel = $(this).attr('[(ngModel)]');
                            const min = $(this).attr('min');
                            const max = $(this).attr('max');
                            let tag = `<p-spinner name="${name}" id="${id}" [(ngModel)]="${ngModel}" `;

                            if ($(this).attr('min')) {
                                tag += `min="${min}" `;
                            }

                            if ($(this).attr('max')) {
                                tag += `max="${max}" `;
                            }

                            if ($(this).attr('required')) {
                                tag += 'required ';
                            }

                            tag += '></p-spinner>';
                            $(this).replaceWith(tag);
                        });
                    }

                    if (this.fieldsContainBoolean) {
                        const name = $(this).attr('name');
                        const id = $(this).attr('id');
                        const ngModel = $(this).attr('[(ngModel)]');
                        $('input[type=checkbox]').each(function () {
                            let tag = `<p-checkbox name="${name}" id="${id}" [(ngModel)]="${ngModel}" `;

                            if ($(this).attr('required')) {
                                tag += 'required ';
                            }

                            tag += '></p-checkbox>';
                            $(this).replaceWith(tag);
                        });
                    }

                    if (this.fieldsContainLocalDate || this.fieldsContainInstant || this.fieldsContainZonedDateTime) {
                        $('input[type=datetime-local],input[ngbDatepicker][type="text"]').each(function () {
                            const name = $(this).attr('name');
                            const id = $(this).attr('id');
                            const ngModel = $(this).attr('[(ngModel)]');
                            let tag = `<p-calendar name="${name}" id="${id}" [(ngModel)]="${ngModel}" showButtonBar="true" showIcon="true" monthNavigator="true" yearNavigator="true" `;

                            if ($(this).attr('type') === 'datetime-local') {
                                tag += 'showTime="true"';
                            }

                            if ($(this).attr('required')) {
                                tag += 'required ';
                            }

                            tag += '></p-calendar>';
                            $(this).replaceWith(tag);
                        });

                        // remove calendar icon
                        if (this.fieldsContainLocalDate) {
                            $('i.fa-calendar').each(function () {
                                $(this).parent().parent().remove();
                            });
                        }
                    }

                    if (this.fieldsContainText) {
                        // add pInputText attribute to input text tags that dont have
                        $('input:not([pInputText]):not([ngbDatepicker])[type="text"]').each(function () {
                            $(this).attr('pInputText', '');
                        });
                    }

                    if (this.fieldsContainEnum) {
                        $('select').each(function () {
                            // do this only for enums, not relations
                            if (self.enumFields.indexOf($(this).attr('name')) > -1) {
                                const optionName = `${$(this).attr('name')}ValueArr`;
                                const name = $(this).attr('name');
                                const id = $(this).attr('id');
                                const ngModel = $(this).attr('[(ngModel)]');
                                let tag = `<p-dropdown name="${name}" id="${id}" [(ngModel)]="${ngModel}" [options]="${optionName}" `;

                                if ($(this).attr('required')) {
                                    tag += 'required ';
                                }

                                tag += '></p-dropdown>';
                                $(this).replaceWith(tag);
                            }
                        });
                    }

                    // remove ="" parts of empty value attributes that cheerio creates
                    htmlContent = $.html().replace(/=""/gi, '');

                    this.fs.write(htmlFilePath, htmlContent);
                }, this);
            }
        }
    },


    install() {
        let logMsg =
            `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

        if (this.clientFramework === 'angular1') {
            logMsg =
                `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install & bower install`)}`;
        }
        const injectDependenciesAndConstants = (err) => {
            if (err) {
                this.warning('Install of dependencies failed!');
                this.log(logMsg);
            } else if (this.clientFramework === 'angular1') {
                this.spawnCommand('gulp', ['install']);
            }
        };
        const installConfig = {
            bower: this.clientFramework === 'angular1',
            npm: this.clientPackageManager !== 'yarn',
            yarn: this.clientPackageManager === 'yarn',
            callback: injectDependenciesAndConstants
        };
        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            this.installDependencies(installConfig);
        }
    },

    end() {
        this.log('End of primeng-entity generator');
    }
});
