# Provisional vital statistics data
This repository contains data and documentation on births and deaths in New York City. [You can see a webpage with visualizations and descriptions of these data here](https://www.nyc.gov/site/doh/data/data-home.page) (URL TK). 

## Technical notes

### Repository content
This repository contains:
- `data.csv`: this file contains quarterly, provisional birth and death data for the most recent 10 quarters available, for all metrics and groups. This file feeds the visualizations on the [Provisional Birth And Death Data webpage](https://www.nyc.gov/site/doh/data/data-home.page) (URL TK)
- `all-data.csv`: this file contains quarterly, provisional birth and death data since Q1, 2022, for all metrics and groups. While the webpage and `data.csv` include only the most recent 10 quarters of data, this file contains older data outside of this rolling window.
- `/data-tables`: this folder contains individual data tables for the data available in `data.csv`
- `/page-development`: this folder contains page code for the [Provisional Birth And Death Data webpage](https://www.nyc.gov/site/doh/data/data-home.page) (URL TK)

Data files include the following fields:
- `date`: Expressed as Mon DD YYYY, corresponding to the first date of the quarter. Eg, `Jan 1 2022` reflects Q1 2022.
- `metric`: The metric expressed
- `submetric`: The group
- `value`: the numeric value
- `display`: the value type - Eg, number (count), percent, or rate per 1,000 live births.

### Reporting Lag

Data are provisional and updated quarterly, with most indicators having a three-month lag. This delay ensures greater completeness of data reporting, particularly for the most recent quarter. Overdose death data have a six-month lag due to the extended time required by the Office of Chief Medical Examiner to perform autopsies, toxicology reports, and other investigations, allowing them to finalize the causes of death.

All data on the “Provisional Birth and Death Data” page are provisional, and therefore, subject to change. More recent quarters are likely to change more than earlier quarters.

### Cause of Death Coding

Reported causes of death are coded using the National Center for Health Statistics (NCHS) automated coding software package, SuperMICAR, which classifies conditions according to the International Classification of Diseases, 10th Revision (ICD-10), published by the World Health Organization. A single underlying cause is assigned based on the reported chain of events leading to death. Standardized codes enable for national and international comparisons. Causes of death that cannot be coded by SuperMICAR are investigated and coded by nosologists.

### Smoothing of Infant Mortality Data

To account for random variations due to the small number of infant deaths, infant mortality rates are presented as a moving average. This average uses data from four quarters: the current quarter and the prior three quarters.

### Definitions of Selected Variables
- **Infant mortality rate**: Number of infant deaths (less than 1 year of age) per 1,000 live births.
- **Very pre-term births**: Percentage of births at a clinical estimated gestational age of less than 32 weeks.
- **Pre-term births**: Percentage of births at a clinical estimated gestational age of less than 37 weeks.
- **Term births**: Percentage of births at a clinical estimated gestational age of 37 or more weeks.
- **Very low birthweight**: Percentage of births with a birthweight of less than 1,500 grams.
- **Low birthweight**: Percentage of births with a birthweight of less than 2,500 grams.
- **Normal birthweight**: Percentage of births with a birthweight of 2,500 grams or more.
- **Pre-pregnancy diabetes**: Percentage of mothers with pre-pregnancy diabetes.
- **Pre-pregnancy hypertension**: Percentage of mothers with pre-pregnancy hypertension.
- **Prenatal care in first trimester**: Percentage of mothers who received prenatal care in the first trimester of pregnancy.
- **Breastfed infants**: Percentage of infants who were exclusively breastfed or breastfed in combination with formula, at the time of birth certification.

### Abbreviation of the Names of Causes of Death
- **Chronic liver disease**: Chronic liver disease and cirrhosis.
- **CLRD**: Chronic lower respiratory diseases.

## Contact us

You can open issues with questions and we will provide information if possible.

## Communications disclaimer

With regard to GitHub platform communications, staff from the New York City Department of Health & Mental Hygiene are authorized to answer specific questions of a technical nature with regard to this repository. Staff may not disclose private or sensitive data. 
