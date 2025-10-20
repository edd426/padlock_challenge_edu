// Math Padlock Challenge - Infrastructure as Code
// Deploy all Azure resources needed for the application

targetScope = 'resourceGroup'

// Parameters
param location string = 'eastus2'
param environment string = 'prod'
param storageAccountName string = 'stpadlockchallenge'

// Variables
var tags = {
  project: 'padlock-challenge'
  environment: environment
  createdBy: 'Bicep-IaC'
}

// Create Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2021-06-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
  }
  tags: tags
}

// Create Table Storage for challenges
resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2021-06-01' = {
  parent: storageAccount
  name: 'default'
}

resource challengesTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2021-06-01' = {
  parent: tableService
  name: 'challenges'
}

// Output values for deployment
output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
output storageConnectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, '2021-06-01').keys[0].value};EndpointSuffix=core.windows.net'
output challengesTableName string = challengesTable.name
output location string = location
