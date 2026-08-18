// src/server/swagger.ts

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Studio Books API',
    version: '1.0.0',
    description:
      'Firm-first multi-client bookkeeping API with immutable double-entry ledger, Canadian sales tax engine (GST/HST/QST), bank feed reconciliation, and OCR receipt ingestion.',
    contact: {
      name: 'Studio Books Engineering',
      email: 'support@studiobooks.io',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'Firm & Practice', description: 'Practice boundary, staff users, and global metrics' },
    { name: 'Client Businesses', description: 'Canadian corporate and sole-prop client entities' },
    { name: 'Chart of Accounts', description: 'Standard Canadian 4-digit GL accounts (Operating & Trust)' },
    { name: 'General Ledger', description: 'Double-entry balanced journal entries and immutable reversals' },
    { name: 'Banking & Feeds', description: 'Statement transaction ingestion and 2-way reconciliation' },
    { name: 'Receipts & OCR', description: 'Invoice document intake and automated GL posting' },
    { name: 'Tax & Financial Reports', description: 'CRA (Line 105/108) and Revenu Québec (Line 205/208) summaries' },
  ],
  components: {
    securitySchemes: {
      FirmHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-firm-id',
        description: 'Practice Tenant ID (e.g. firm-studio-books-001)',
      },
      ClientHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-client-id',
        description: 'Active Client Business ID (e.g. client-boucherie-01)',
      },
      UserHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-user-id',
        description: 'Active Staff User ID (e.g. usr-sarah-04)',
      },
    },
    schemas: {
      FirmOverview: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'firm-studio-books-001' },
          name: { type: 'string', example: 'Studio Bookkeeping & Associates Inc.' },
          subscriptionTier: { type: 'string', example: 'practice_flagship' },
          activeClientLimit: { type: 'integer', example: 15 },
          activeClientsCount: { type: 'integer', example: 12 },
          totalUnreconciledBankTx: { type: 'integer', example: 60 },
          totalPendingReceipts: { type: 'integer', example: 36 },
        },
      },
      ClientBusiness: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'client-boucherie-01' },
          firmId: { type: 'string', example: 'firm-studio-books-001' },
          legalName: { type: 'string', example: 'Boucherie Plateau Inc.' },
          operatingName: { type: 'string', example: 'Boucherie du Plateau Mont-Royal' },
          businessNumber: { type: 'string', example: '839210482RC0001' },
          provinceCode: { type: 'string', enum: ['QC', 'ON', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'], example: 'QC' },
          reportingFrequency: { type: 'string', enum: ['monthly', 'quarterly', 'annual'], example: 'quarterly' },
          gstRegistered: { type: 'boolean', example: true },
          gstNumber: { type: 'string', example: '839210482RT0001' },
          qstRegistered: { type: 'boolean', example: true },
          qstNumber: { type: 'string', example: '1289304921TQ0001' },
          fiscalYearEndMonth: { type: 'integer', example: 12 },
          currency: { type: 'string', example: 'CAD' },
          status: { type: 'string', example: 'Up to Date' },
          assignedBookkeeper: { type: 'string', example: 'Sarah Tremblay, CPA' },
          unreconciledCount: { type: 'integer', example: 5 },
          pendingReceiptsCount: { type: 'integer', example: 3 },
        },
      },
      ChartOfAccount: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'acc-client-boucherie-01-1010' },
          accountCode: { type: 'string', example: '1010' },
          name: { type: 'string', example: 'Desjardins Operating Checking (CAD)' },
          type: { type: 'string', enum: ['asset', 'liability', 'equity', 'revenue', 'expense'], example: 'asset' },
          classification: { type: 'string', example: 'bank' },
          currency: { type: 'string', example: 'CAD' },
          currentBalance: { type: 'number', example: 42150.25 },
        },
      },
      LedgerLine: {
        type: 'object',
        required: ['accountId', 'description', 'debit', 'credit'],
        properties: {
          accountId: { type: 'string', example: 'acc-client-boucherie-01-6000' },
          description: { type: 'string', example: 'Commercial Rent Lease' },
          debit: { type: 'number', example: 3200.0 },
          credit: { type: 'number', example: 0.0 },
          taxCode: { type: 'string', example: 'GST_QST' },
          taxAmount: { type: 'number', example: 479.2 },
        },
      },
      JournalEntry: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'je-1001' },
          clientBusinessId: { type: 'string', example: 'client-boucherie-01' },
          entryNumber: { type: 'integer', example: 1001 },
          entryDate: { type: 'string', format: 'date', example: '2026-07-01' },
          memo: { type: 'string', example: 'Commercial Studio Rent - July 2026' },
          source: { type: 'string', example: 'manual' },
          status: { type: 'string', enum: ['draft', 'posted', 'reversed'], example: 'posted' },
          createdBy: { type: 'string', example: 'Sarah Tremblay, CPA' },
          postedAt: { type: 'string', format: 'date-time' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/LedgerLine' },
          },
        },
      },
      SalesTaxSummary: {
        type: 'object',
        properties: {
          period: { type: 'string', example: '2026-Q2' },
          province: { type: 'string', example: 'QC' },
          gst: {
            type: 'object',
            properties: {
              line101SalesTotal: { type: 'number', example: 12000.0 },
              line105GstCollected: { type: 'number', example: 600.0 },
              line108ItcsClaimed: { type: 'number', example: 191.25 },
              line109NetGstPayable: { type: 'number', example: 408.75 },
            },
          },
          qst: {
            type: 'object',
            properties: {
              line201SalesTotal: { type: 'number', example: 12000.0 },
              line205QstCollected: { type: 'number', example: 1197.0 },
              line208ItrsClaimed: { type: 'number', example: 381.55 },
              line209NetQstPayable: { type: 'number', example: 815.45 },
            },
          },
          totalRemittanceDue: { type: 'number', example: 1224.2 },
        },
      },
    },
  },
  security: [
    { FirmHeader: [], ClientHeader: [], UserHeader: [] },
  ],
  paths: {
    '/api/v1/health': {
      get: {
        summary: 'Service Health Check',
        responses: {
          200: { description: 'API is healthy' },
        },
      },
    },
    '/api/v1/firm/overview': {
      get: {
        tags: ['Firm & Practice'],
        summary: 'Get Practice Overview & Client Workload Metrics',
        responses: {
          200: {
            description: 'Practice details and aggregate counts',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FirmOverview' },
              },
            },
          },
        },
      },
    },
    '/api/v1/clients': {
      get: {
        tags: ['Client Businesses'],
        summary: 'List All Client Businesses',
        responses: {
          200: {
            description: 'Array of client businesses',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ClientBusiness' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Client Businesses'],
        summary: 'Provision New Client & Auto-Generate Canadian Chart of Accounts',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['legalName', 'provinceCode'],
                properties: {
                  legalName: { type: 'string', example: 'Apex Creative Studio Inc.' },
                  operatingName: { type: 'string', example: 'Apex Studio' },
                  businessNumber: { type: 'string', example: '920194820RC0001' },
                  provinceCode: { type: 'string', example: 'QC' },
                  reportingFrequency: { type: 'string', example: 'quarterly' },
                  gstRegistered: { type: 'boolean', example: true },
                  qstRegistered: { type: 'boolean', example: true },
                  fiscalYearEndMonth: { type: 'integer', example: 12 },
                  assignedBookkeeper: { type: 'string', example: 'Sarah Tremblay, CPA' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Client provisioned successfully' },
        },
      },
    },
    '/api/v1/clients/{clientId}/accounts': {
      get: {
        tags: ['Chart of Accounts'],
        summary: 'Get Chart of Accounts with Live Balances',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'List of accounts with calculated net debit/credit balance',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ChartOfAccount' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Chart of Accounts'],
        summary: 'Create Custom Canadian Account Code',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['accountCode', 'name', 'type', 'classification'],
                properties: {
                  accountCode: { type: 'string', example: '6600' },
                  name: { type: 'string', example: 'Marketing & Digital Ads' },
                  type: { type: 'string', example: 'expense' },
                  classification: { type: 'string', example: 'operating_expense' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Account created' },
        },
      },
    },
    '/api/v1/clients/{clientId}/journal-entries': {
      get: {
        tags: ['General Ledger'],
        summary: 'List Double-Entry Journal Entries',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Array of balanced journal entries and ledger lines',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/JournalEntry' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['General Ledger'],
        summary: 'Post Balanced Journal Entry (Atomic SQL Transaction)',
        description: 'Enforces mathematical equality SUM(Debits) === SUM(Credits). Rejects imbalanced entries with HTTP 422.',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['entryDate', 'memo', 'lines'],
                properties: {
                  entryDate: { type: 'string', format: 'date', example: '2026-08-17' },
                  memo: { type: 'string', example: 'Bell Canada Fiber Telecom' },
                  source: { type: 'string', example: 'manual' },
                  lines: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/LedgerLine' },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Journal entry posted successfully' },
          422: { description: 'Imbalanced entry error' },
        },
      },
    },
    '/api/v1/clients/{clientId}/journal-entries/{entryId}/reverse': {
      post: {
        tags: ['General Ledger'],
        summary: 'Post CRA-Compliant Immutable Reversal Entry',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'entryId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', example: 'Incorrect tax calculation correction' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Reversal entry created' },
        },
      },
    },
    '/api/v1/clients/{clientId}/bank-transactions': {
      get: {
        tags: ['Banking & Feeds'],
        summary: 'List Bank Statement Feed Transactions',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of bank transactions with reconciliation state' },
        },
      },
    },
    '/api/v1/clients/{clientId}/bank-transactions/reconcile': {
      post: {
        tags: ['Banking & Feeds'],
        summary: 'Reconcile Bank Transaction & Generate Matching Ledger Entry',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['transactionId', 'targetAccountId'],
                properties: {
                  transactionId: { type: 'string', example: 'bank-tx-client-boucherie-01-001' },
                  targetAccountId: { type: 'string', example: 'acc-client-boucherie-01-6200' },
                  taxCode: { type: 'string', example: 'GST_QST' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reconciliation complete' },
        },
      },
    },
    '/api/v1/clients/{clientId}/receipts': {
      get: {
        tags: ['Receipts & OCR'],
        summary: 'List OCR Ingested Receipts',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of receipt documents' },
        },
      },
      post: {
        tags: ['Receipts & OCR'],
        summary: 'Ingest Receipt Document with Extracted Line Items',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vendor', 'total'],
                properties: {
                  vendor: { type: 'string', example: 'Bureau en Gros / Staples' },
                  total: { type: 'number', example: 258.45 },
                  fileName: { type: 'string', example: 'staples_invoice.pdf' },
                  suggestedAccountId: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Receipt ingested' },
        },
      },
    },
    '/api/v1/clients/{clientId}/receipts/{receiptId}/post': {
      post: {
        tags: ['Receipts & OCR'],
        summary: 'Post Receipt Invoice to General Ledger (AP + Expenses + Tax ITCs)',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'receiptId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['targetAccountId'],
                properties: {
                  targetAccountId: { type: 'string', example: 'acc-client-boucherie-01-6100' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Receipt posted to ledger' },
        },
      },
    },
    '/api/v1/clients/{clientId}/reports/sales-tax-summary': {
      get: {
        tags: ['Tax & Financial Reports'],
        summary: 'Get Canadian Sales Tax Summary (CRA Line 105/108 & RQ Line 205/208)',
        parameters: [
          { name: 'clientId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'period', in: 'query', schema: { type: 'string', example: '2026-Q2' } },
        ],
        responses: {
          200: {
            description: 'Sales tax calculation summary for CRA & RQ remittances',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SalesTaxSummary' },
              },
            },
          },
        },
      },
    },
  },
};
