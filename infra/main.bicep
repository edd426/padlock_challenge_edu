// Math Padlock Challenge - Infrastructure as Code
// Deploy all Azure resources needed for the application

targetScope = 'subscription'

// Parameters
param location string = 'eastus2'
param environment string = 'prod'
param resourceGroupName string = 'rg-padlock-challenge'
param storageAccountName string = 'stpadlockchallenge'
param staticWebAppName string = 'app-padlock-challenge'
param githubRepo string = 'edd426/padlock_challenge_edu'
param githubBranch string = 'main'

// Variables
var suffix = environment == 'prod' ? '' : '-${environment}'
var tags = {
  project: 'padlock-challenge'
  environment: environment
  createdBy: 'Bicep-IaC'
  createdDate: utcNow('u')
}

// Create Resource Group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

// Create Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2021-06-01' = {
  scope: resourceGroup
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

// Get Storage Account connection string (for later use)
@export()
output storageConnectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, '2021-06-01').keys[0].value};EndpointSuffix=core.windows.net'

// Output values for deployment
output resourceGroupId string = resourceGroup.id
output resourceGroupName string = resourceGroup.name
output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
output challengesTableName string = challengesTable.name
output location string = location
