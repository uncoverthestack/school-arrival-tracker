const spec = {
  openapi: '3.0.3',
  info: {
    title: 'SchoolPass — DataOcelot Schools API',
    version: '1.0.0',
    description: `
## Authentication

Most endpoints require one of two auth methods:

| Method | How | Used for |
|--------|-----|----------|
| **API Key** | \`x-api-key: <school_api_key>\` header | Gate kiosk, external integrations |
| **Session cookie** | Automatically set after \`POST /api/auth/login\` | Browser-based admin portal |
| **Super Admin session** | Set after \`POST /api/superadmin/login\` | Super admin panel only |

Your school API key is shown in the dashboard after login.

## Rate Limits (Token Bucket)

| Endpoint group | Limit |
|---------------|-------|
| \`/api/scan\` | 60 req / min |
| \`/api/auth/login\` | 10 req / 15 min |
| \`/api/signup\`, \`/api/register\` | 5 req / min |

## Base URL

Production: \`https://{subdomain}.dataocelotschools.com\`
    `.trim()
  },
  servers: [
    { url: 'https://dataocelotschools.com', description: 'Production' },
    { url: 'http://localhost:3000', description: 'Local dev' }
  ],
  tags: [
    { name: 'School Signup', description: 'Register a new school on the platform' },
    { name: 'Authentication', description: 'School admin login / logout' },
    { name: 'Students', description: 'Student management — requires API key or admin session' },
    { name: 'Arrivals & Scanning', description: 'Gate scan and arrival log — requires API key' },
    { name: 'Stats', description: 'Attendance summary — requires API key' },
    { name: 'Parent Registration', description: 'Parent phone OTP verification flow' },
    { name: 'Super Admin', description: 'Platform-level school management — requires super admin session' }
  ],
  components: {
    securitySchemes: {
      ApiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'School API key — find it in your admin dashboard'
      }
    },
    schemas: {
      Student: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          student_id: { type: 'string', example: 'SCH-2025-0001' },
          name: { type: 'string', example: 'Adaeze Okafor' },
          student_class: { type: 'string', example: 'JSS 2B' },
          parent_name: { type: 'string', nullable: true },
          parent_phone: { type: 'string', example: '+2348012345678' },
          parent_email: { type: 'string', nullable: true },
          card_id: { type: 'string', nullable: true },
          code: { type: 'string', example: '482917', description: '6-digit gate code' },
          code_year: { type: 'string', example: '2025-2026' },
          photo_url: { type: 'string', format: 'uri', nullable: true },
          face_descriptor: { type: 'string', nullable: true, description: 'JSON array of 128 floats (face-api.js descriptor). Null if not enrolled.' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      Arrival: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['arrival', 'departure'] },
          scannedAt: { type: 'string', format: 'date-time' },
          time: { type: 'string', example: '08:24', description: 'Formatted Lagos time (HH:MM)' },
          name: { type: 'string' },
          studentClass: { type: 'string' },
          studentId: { type: 'string' }
        }
      },
      StudentSummary: {
        type: 'object',
        description: 'Student info returned inside scan responses',
        properties: {
          name: { type: 'string' },
          studentClass: { type: 'string' },
          studentId: { type: 'string' },
          photoUrl: { type: 'string', format: 'uri', nullable: true }
        }
      },
      School: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          subdomain: { type: 'string' },
          admin_email: { type: 'string', format: 'email' },
          status: { type: 'string', enum: ['pending', 'active', 'payment_due', 'suspended', 'archived'] },
          school_type: { type: 'string', enum: ['primary', 'secondary', 'combined', 'nursery', 'tertiary'] },
          studentCount: { type: 'integer' },
          payment_approved_at: { type: 'string', format: 'date-time', nullable: true },
          payment_due_at: { type: 'string', format: 'date-time', nullable: true },
          pending_expires_at: { type: 'string', format: 'date-time', nullable: true },
          archived_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },
  paths: {
    // ── School Signup ────────────────────────────────────────────────
    '/api/signup': {
      post: {
        tags: ['School Signup'],
        summary: 'Register a new school',
        description: 'Creates a school in **pending** status. Access is blocked until a super admin approves. The subdomain is reserved for 48 hours.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['schoolName', 'subdomain', 'email', 'password'],
                properties: {
                  schoolName: { type: 'string', example: 'Sunshine Academy' },
                  subdomain: { type: 'string', example: 'sunshine', description: '3–32 chars, lowercase letters, numbers, hyphens' },
                  email: { type: 'string', format: 'email', example: 'admin@sunshine.edu.ng' },
                  password: { type: 'string', minLength: 8, example: 'securepass123' },
                  schoolType: {
                    type: 'string',
                    enum: ['primary', 'secondary', 'combined', 'nursery', 'tertiary'],
                    default: 'primary'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'School registered — awaiting super admin approval',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    pending: { type: 'boolean', example: true },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Subdomain or email already taken', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Rate limited', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ── Authentication ───────────────────────────────────────────────
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'School admin login',
        description: 'Authenticates the school admin and sets an `sp-admin` session cookie. Required before accessing admin portal endpoints.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  schoolKey: { type: 'string', description: 'API key — required when not on the school subdomain' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful — session cookie set',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    school: { type: 'string', description: 'School name' }
                  }
                }
              }
            }
          },
          401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Account pending / payment due / suspended / archived', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many login attempts (10 / 15 min)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'School admin logout',
        description: 'Clears the `sp-admin` session cookie.',
        responses: {
          200: { description: 'Logged out', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } }
        }
      }
    },

    // ── Students ─────────────────────────────────────────────────────
    '/api/students': {
      get: {
        tags: ['Students'],
        summary: 'List all students',
        description: 'Returns all students for the school. Accepts either an API key header or an active admin session cookie.',
        security: [{ ApiKey: [] }],
        responses: {
          200: {
            description: 'Student list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    students: { type: 'array', items: { $ref: '#/components/schemas/Student' } }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      post: {
        tags: ['Students'],
        summary: 'Create a student',
        description: 'Adds a new student and auto-generates a `student_id` and 6-digit `code`. Requires API key or admin session.',
        security: [{ ApiKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'studentClass', 'parentPhone'],
                properties: {
                  name: { type: 'string', example: 'Adaeze Okafor' },
                  studentClass: { type: 'string', example: 'JSS 2B' },
                  parentPhone: { type: 'string', example: '+2348012345678' },
                  parentName: { type: 'string', nullable: true },
                  parentEmail: { type: 'string', format: 'email', nullable: true },
                  cardId: { type: 'string', nullable: true, description: 'Physical card ID — defaults to student_id if omitted' },
                  photoUrl: { type: 'string', format: 'uri', nullable: true }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Student created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { student: { $ref: '#/components/schemas/Student' } }
                }
              }
            }
          },
          400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/students/{id}': {
      patch: {
        tags: ['Students'],
        summary: 'Update a student',
        description: 'Updates name, class, photo, or face descriptor. Changing the class rotates the gate code (promotion). Keeping the same class preserves the code (repeating year).',
        security: [{ ApiKey: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  studentClass: { type: 'string' },
                  photoUrl: { type: 'string', format: 'uri', nullable: true },
                  faceDescriptor: {
                    type: 'array',
                    items: { type: 'number' },
                    minItems: 128,
                    maxItems: 128,
                    nullable: true,
                    description: '128-element Float32Array from face-api.js. Pass null to remove face enrollment.'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Student updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    student: { $ref: '#/components/schemas/Student' },
                    codeRotated: { type: 'boolean', description: 'True if the gate code was regenerated (class promotion)' }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Student not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      delete: {
        tags: ['Students'],
        summary: 'Delete a student',
        description: 'Permanently removes the student and all their arrival records. This cannot be undone.',
        security: [{ ApiKey: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Student not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/students/descriptors': {
      get: {
        tags: ['Students'],
        summary: 'Get enrolled face descriptors',
        description: 'Returns all students who have a face descriptor enrolled. Used by the gate kiosk to build the face matcher on load.',
        security: [{ ApiKey: [] }],
        responses: {
          200: {
            description: 'Enrolled students with descriptors',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    students: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          name: { type: 'string' },
                          code: { type: 'string' },
                          student_id: { type: 'string' },
                          student_class: { type: 'string' },
                          photo_url: { type: 'string', nullable: true },
                          face_descriptor: { type: 'string', description: 'JSON-encoded Float32Array (128 floats)' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ── Arrivals & Scanning ──────────────────────────────────────────
    '/api/scan': {
      post: {
        tags: ['Arrivals & Scanning'],
        summary: 'Record a student scan',
        description: 'The primary gate endpoint. Looks up the student by card ID, student ID, or 6-digit code. Records arrival or departure. Notifies the parent via SMS/WhatsApp if a phone is registered. Duplicate scans on the same day return a `duplicate: true` response without creating a new record.\n\n**Rate limit:** 60 req / min per school.',
        security: [{ ApiKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cardId'],
                properties: {
                  cardId: { type: 'string', example: '482917', description: 'Card ID, student ID, or 6-digit gate code' },
                  type: { type: 'string', enum: ['arrival', 'departure'], default: 'arrival' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Scan processed',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      title: 'Success',
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        student: { $ref: '#/components/schemas/StudentSummary' },
                        time: { type: 'string', example: '08:24' },
                        message: { type: 'string', example: 'Arrived at 08:24 — parent notified' }
                      }
                    },
                    {
                      title: 'Duplicate',
                      type: 'object',
                      properties: {
                        duplicate: { type: 'boolean', example: true },
                        student: { $ref: '#/components/schemas/StudentSummary' },
                        message: { type: 'string', example: 'Already scanned at 08:24' }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { description: 'Missing or invalid cardId / type', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Invalid API key', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Student not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Rate limited', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/arrivals': {
      get: {
        tags: ['Arrivals & Scanning'],
        summary: 'Get arrivals for a date',
        description: 'Returns all arrival and departure records for the given date (defaults to today). Accepts API key or admin session.',
        security: [{ ApiKey: [] }],
        parameters: [
          {
            name: 'date',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date', example: '2025-11-04' },
            description: 'ISO date (YYYY-MM-DD). Defaults to today (Africa/Lagos timezone).'
          }
        ],
        responses: {
          200: {
            description: 'Arrival records',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    arrivals: { type: 'array', items: { $ref: '#/components/schemas/Arrival' } },
                    date: { type: 'string', format: 'date' }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ── Stats ────────────────────────────────────────────────────────
    '/api/stats': {
      get: {
        tags: ['Stats'],
        summary: 'Today\'s attendance summary',
        description: 'Returns total students enrolled, how many have arrived today, and how many have not yet arrived.',
        security: [{ ApiKey: [] }],
        responses: {
          200: {
            description: 'Attendance summary',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    school: { type: 'string' },
                    totalStudents: { type: 'integer' },
                    arrivedToday: { type: 'integer' },
                    notArrived: { type: 'integer' },
                    date: { type: 'string', format: 'date' }
                  }
                },
                example: {
                  school: 'Sunshine Academy',
                  totalStudents: 312,
                  arrivedToday: 287,
                  notArrived: 25,
                  date: '2025-11-04'
                }
              }
            }
          },
          401: { description: 'Invalid API key', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ── Parent Registration ──────────────────────────────────────────
    '/api/register': {
      post: {
        tags: ['Parent Registration'],
        summary: 'Start parent phone registration',
        description: 'Validates that the submitted phone number matches what the school has on file, then sends a 6-digit OTP via SMS. The school must pre-register the parent phone when adding the student — this prevents students from registering someone else\'s number.\n\n**Rate limit:** 5 req / min.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'parentName', 'parentPhone'],
                properties: {
                  code: { type: 'string', example: '482917', description: "Student's 6-digit gate code" },
                  parentName: { type: 'string', example: 'Mrs Okafor' },
                  parentPhone: { type: 'string', example: '+2348012345678', description: 'Must match school records exactly' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'OTP sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    pending: { type: 'boolean', example: true },
                    verificationId: { type: 'string', format: 'uuid' },
                    studentName: { type: 'string' },
                    message: { type: 'string' },
                    devOtp: { type: 'string', description: 'Only present in non-production environments' }
                  }
                }
              }
            }
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Phone does not match school records, or no parent phone on file', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Invalid student code', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Rate limited', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/verify': {
      post: {
        tags: ['Parent Registration'],
        summary: 'Complete OTP verification',
        description: 'Verifies the OTP from `/api/register`. On success, marks the parent as verified and updates the student record with the confirmed phone and parent name.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['verificationId', 'otp', 'parentName'],
                properties: {
                  verificationId: { type: 'string', format: 'uuid', description: 'Returned by /api/register' },
                  otp: { type: 'string', example: '839201', description: '6-digit code from SMS' },
                  parentName: { type: 'string', example: 'Mrs Okafor' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Verified — parent registered for notifications',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    student: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        studentClass: { type: 'string' }
                      }
                    },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          400: { description: 'Incorrect OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Invalid verificationId', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          410: { description: 'OTP already used or expired', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ── Super Admin ──────────────────────────────────────────────────
    '/api/superadmin/login': {
      post: {
        tags: ['Super Admin'],
        summary: 'Super admin login',
        description: 'Authenticates the super admin and sets an `sp-super` session cookie. Credentials are set via `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` environment variables.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Logged in', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/superadmin/logout': {
      post: {
        tags: ['Super Admin'],
        summary: 'Super admin logout',
        responses: {
          200: { description: 'Logged out', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } }
        }
      }
    },
    '/api/superadmin/schools': {
      get: {
        tags: ['Super Admin'],
        summary: 'List all schools',
        description: 'Returns all schools across all statuses with student counts. Requires super admin session.',
        responses: {
          200: {
            description: 'Schools list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    schools: { type: 'array', items: { $ref: '#/components/schemas/School' } }
                  }
                }
              }
            }
          },
          401: { description: 'Not authenticated as super admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      patch: {
        tags: ['Super Admin'],
        summary: 'Update school status',
        description: `Performs a lifecycle action on a school.

| Action | From status | Effect |
|--------|-------------|--------|
| \`approve\` | pending / payment_due | Sets status to **active**, records approval timestamp, sets \`payment_due_at\` |
| \`reject\` | pending only | **Permanently deletes** the school record, freeing the subdomain |
| \`suspend\` | active | Blocks all login — data preserved |
| \`restore\` | suspended / archived | Re-activates the school |
| \`archive\` | active / payment_due / suspended | Soft-deletes |`,
        parameters: [
          { name: 'id', in: 'query', required: true, schema: { type: 'string', format: 'uuid' }, description: 'School ID' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: { type: 'string', enum: ['approve', 'reject', 'suspend', 'restore', 'archive'] },
                  paymentDays: { type: 'integer', default: 30, description: 'Days until payment is due — used with `approve` action only' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Action applied', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          400: { description: 'Invalid action or wrong status', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'School not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      delete: {
        tags: ['Super Admin'],
        summary: 'Permanently delete a school',
        description: '**Irreversible.** Deletes the school and all associated data — students, arrivals, verifications.',
        parameters: [
          { name: 'id', in: 'query', required: true, schema: { type: 'string', format: 'uuid' }, description: 'School ID' }
        ],
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'School not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    }
  }
}

export async function GET() {
  return Response.json(spec, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  })
}
