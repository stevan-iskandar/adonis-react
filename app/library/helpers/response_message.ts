export const responseMessage = (module?: string) => {
  const formattedModule = module ? ` ${module}` : ''
  const message = {
    successFetch: `Success fetch data${formattedModule}`,
    successInsert: `Data${formattedModule} has been inserted`,
    successPublish: `Data${formattedModule} has been published`,
    successUnpublish: `Data${formattedModule} has been unpublished`,
    successUpdate: `Data${formattedModule} has been updated`,
    successDelete: `Data${formattedModule} has been deleted`,
    successSubmit: `Data${formattedModule} has been submitted`,
    successApprove: `Data${formattedModule} has been approved`,
    successSync: `Data${formattedModule} has been synced`,
    successReadExcel: `Success convert Excel${formattedModule}`,
    errorInvalidID: `Invalid${formattedModule} id`,
    errorSubmitted: `Data${formattedModule} has already been submitted`,
  }

  return message
}
