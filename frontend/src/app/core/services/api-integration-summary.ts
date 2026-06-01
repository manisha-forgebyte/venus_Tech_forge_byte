export const API_INTEGRATION_SUMMARY = {
    version: '1.0.6',
    lastUpdated: '2026-01-29',
    integratedPages: 10,
    totalEndpoints: 63,
    status: 'Complete - Phase 1 (updated)',
    
    addUpdate: {
      date: '2026-01-29',
      description: 'API Migration for Company Selection and UI cleanup',
      newAPIs: {
        company: [
          'getCompanyListByUIDAGID(uid, agid) - GET /Company/GetCompanyListByUIDAGID/{uid}/{agid}'
        ]
      },
      changes: [
        {
          component: 'CompanyPageComponent',
          file: 'src/app/features/company/company-page.component.ts',
          updates: [
            'Migrated from getCompanyListByAID(aid) to getCompanyListByUIDAGID(uid, agid)',
            'Added logic to dynamically fetch UID from currentUser in localStorage (defaulting to 1)',
            'Removed the redundant ID span in the company selection sidebar to clean up the UI'
          ]
        },
        {
          component: 'AddNewUserComponent',
          file: 'src/app/features/users/add-new-user.component.ts',
          updates: [
            'Migrated from getCompanyListByAID(aid) to getCompanyListByUIDAGID(uid, agid)',
            'Implemented getUidFromStorage() helper for dynamic UID context',
            'Removed ID span from the user-company selection list to match Company Page style'
          ]
        },
        {
          component: 'AppComponent',
          file: 'src/app/app.component.ts',
          updates: [
            'Implemented dynamic currentYear getter for the global footer'
          ]
        },
        {
          component: 'SelfLimitationsComponent',
          file: 'src/app/features/entities/pages/self-limitations/self-limitations.component.ts',
          status: 'Pending',
          updates: [
            'To update: Replace Balancing_Authority_cd with baa_desc in mapping and payload',
            'To update: Add "West of the Atchafalaya Basin" to dropdown options'
          ]
        },
        {
          component: 'MitigationsComponent',
          file: 'src/app/features/entities/pages/mitigations/mitigations.component.ts',
          status: 'Pending',
          updates: [
            'To update: Replace Balancing_Authority_cd with baa_desc in mapping and payload',
            'To update: Add "West of the Atchafalaya Basin" to dropdown options'
          ]
        }
      ]
    }
  
};
