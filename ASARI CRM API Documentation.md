# ASARI CRM API Documentation

## Introduction

The data downloaded by API should be saved to a local database. Web pages should display data from the database prepared in that way.

Number of queries to the API is restricted to **25 per minute** (It's best to use a 3-4 second interval). Limit of connection can undergo change.

API methods serve HTTP calls responding with JSON (http://www.json.org/).

### apiSITE
`apiSite` authorized only by `userId` and `Token` in HEADER.

**Main url:** `https://api.asari.pro`

## Response Format

Every response object has property:
* `success` (boolean) - determining if response is valid or error occurred.

### Success Response

JSON object with properties:
* `data` (object or array of objects)
* `totalCount` (integer) - returned if data is array and method enables pagination

**Example simple object:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "propertyType": "House"
  }
}
```

**Example list:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "propertyType": "House" },
    { "id": 2, "propertyType": "Lot" },
    { "id": 3, "propertyType": "House" }
  ],
  "totalCount": 140
}
```

### Error Response

JSON object with properties:
* `error` (string) - error message in human readable format (localized)
* `parametersErrors` (object where properties are names of parameters and values are error messages related to given parameter) - returned if error is related to input parameters. F.ex. can be used as error messages for forms submitted by user.

**Example error:**
```json
{
  "success": false,
  "error": "You need to activate asariCRM to add tasks"
}
```

**Example error with parameter errors:**
```json
{
  "success": false,
  "error": "Invalid input",
  "parameterErrors": {
    "email": "Invalid format",
    "password": "Password to short"
  }
}
```

## Return Types

Method will return JSON object with following properties:

| Type | Format | Example |
| :--- | :--- | :--- |
| `string` | text | `"bla bla bla"` |
| `integer` | number | `3242` |
| `float` | decimal part separated by period | `3232.3232` |
| `date` | text in format yyyy-MM-dd hh:mm:ss | `"2010-12-31 18:55:58"` |
| `boolean` | true, false | |
| `money` | object: `{ amount: (float), currency: (string) }` | `{ "amount": 251, "currency": "PLN" }` |

## Dictionaries

| Name | Values |
| :--- | :--- |
| `fieldType` | string, integer, float, date, boolean, money, dictionary, dictionaryList |
| `view` | show, edit, list, search |
| `section` | ApartmentSale (Apartment for Sale), ApartmentRental (Apartment for Rental), HouseSale, HouseRental, LotSale, LotRental, CommercialSpaceSale, CommercialSpaceRental, CommercialObjectSale, CommercialObjectRental, WarehouseSale, WarehouseRental, Investment, RoomRental |
| `status` | Active, Cancelled, Closed, Pending, Draft |
| `taskStatus` | Waiting, Solved, Cancelled |
| `taskType` | Regular, Event, Reminder, Appointment, Call |
| `callType` | OUTGOING, INCOMING, MISSED, REJECTED |
| `listingActivityEventType` | Appointment, ContactAcquisition, Email, Printout |
| `seekerActivityEventType` | Appointment, ContactAcquisition, Email |
| `seekerPrivilege` | Contact, PublicContact, Edit, Related |
| `listingPrivilege` | Contact, PublicContact, Edit, Related |
| `contractType` | Exclusive, Open, None, Direct, CustomerApplication |
| `ownershipType` | Mortgage, HousingCooperative, Shared, Other |
| `currency` | PLN, EUR, USD |
| `customerType` | Person, Company, Lead |
| `customerFrom` | Press, Internet, Phone, DirectVisit, Command |
| `commissionPercentPeriod` | Year, Month |
| `valueType` | String, Integer, Float, Date, Boolean, Dictionary, DictionaryList |
| `scope` | All, Company, Swo, Office |
| `condition` | Perfect, VeryGood, Good, NeedsSmallRenovation, NeedsTotalRenovation, NeedsConversion, NeedsFinishing, OpenRawState, CloseRawState |
| `objectClassName` | Listing, Seeker, Customer, Transaction, Invoice, Task, UserBase, Contract, Asset, Chance |
| `documentType` | Agreement, Annex, Termination, Other, Withdrawal, AddressAcquisitionProtocol, ContactAcquisitionProtocol |
| `userType` | Free, Paid |

## Methods

* Required parameters are marked with `*`
* If property is type of dictionary and both names are the same, name of dictionary is omitted f.ex. - `sectionName(dictionary SectionName)` -> `sectionName(dictionary)`
* Methods that don't return any data except of success indicator are marked as `success/failure`
