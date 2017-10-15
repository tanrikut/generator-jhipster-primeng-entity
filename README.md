# generator-jhipster-primeng-entity
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> JHipster module, Updates entity related pages to use Primeng components.

# Introduction

This is a [JHipster](http://jhipster.github.io/) module, that is meant to be used in a JHipster application.

This module is replaces components in entity pages with [PrimeNG](https://www.primefaces.org/primeng) components.

Current entity type and component matchings:

| Entity Type | Primeng Component |
| --- | --- |
| String | [InputText](https://www.primefaces.org/primeng/#/inputtext) |
| Integer<br/>Long<br/>Float<br/>Double<br/>BigDecimal | [Spinner](https://www.primefaces.org/primeng/#/spinner) |
| LocalDate<br/>ZonedDate<br/>Instant | [Calendar](https://www.primefaces.org/primeng/#/calendar) |
| Boolean | [Checbox](https://www.primefaces.org/primeng/#/checkbox) |
| Enum | [Dropdown](https://www.primefaces.org/primeng/#/dropdown) |
| Binary Content | _Not yet_ |
| Relations | _Not yet_ |


# Prerequisites

As this is a [JHipster](http://jhipster.github.io/) module, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://jhipster.github.io/installation.html)

# Installation

## With Yarn

To install this module:

```bash
yarn global add generator-jhipster-primeng-entity
```

To update this module:

```bash
yarn global upgrade generator-jhipster-primeng-entity
```

## With NPM

To install this module:

```bash
npm install -g generator-jhipster-primeng-entity
```

To update this module:

```bash
npm update -g generator-jhipster-primeng-entity
```

# Usage

In your JHipster project, launch `yo jhipster-primeng-entity`.

# License

MIT © [Tankut Koray]()


[npm-image]: https://img.shields.io/npm/v/generator-jhipster-primeng-entity.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-primeng-entity
[travis-image]: https://travis-ci.org/tanrikut/generator-jhipster-primeng-entity.svg?branch=master
[travis-url]: https://travis-ci.org/tanrikut/generator-jhipster-primeng-entity
[daviddm-image]: https://david-dm.org/tanrikut/generator-jhipster-primeng-entity.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/tanrikut/generator-jhipster-primeng-entity
