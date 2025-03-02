export class CreateMerchantDTO {

  name: String;
  industry: String;
  category : String;
  phone: String;
  email: String;
  region:String;
  processorId: String;
  uid : String;
  firstName: String;
  lastName: String;
  phoneNumber : String;
  businessName: String;
  tradingName: String;
  einNumber: String;
  businessNumber: String;
  registrationNumber: String;
  verified : String;
  refCode : String;
  isActive ;
  fullName;
  hasWebsite :String;
  hasPhysicalStore : String;
  storeLocation : String;
  defaultServiceLevel : String;
  servicePermission : String;
  permissions=[] ;
  creatingFor : String;
  isCompany : String;

  merchantId;
  department;
  branch;

  defaultService;
  startTime;
  endTime;
  serviceType;
  defaultBotId;
  conditions;



  templateManagerPermission: String;
}