// ==UserScript==
// @name         Canvas User SIS Clear UI Flags Tool
// @namespace    canvas-sis-user-tool
// @version      1.3
// @description  Export user data and re-import via SIS to clear UI flags
// @match        https://*.instructure.com/accounts/*/users/*
// @match        https://canvas.*/accounts/*/users/*
// @downloadURL  https://mason.gmu.edu/~rsolande/Canvas User SIS Clear UI Flags Tool.user.js
// @updateURL    https://mason.gmu.edu/~rsolande/Canvas User SIS Clear UI Flags Tool.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Auto-detect from URL or set manually
        getAccountId: () => window.location.pathname.match(/\/accounts\/(\d+)/)?.[1] || '1',
        getUserId: () => window.location.pathname.match(/\/users\/(\d+)/)?.[1],
        // CSV settings
        csvFilename: 'user_sis_import.csv'
    };

    // Styles for the UI components
    const STYLES = `
        <style>
            #sis-tool-container {
                margin-top: 8px;
                font-family: 'Lato', sans-serif;
            }

            #sis-export-btn {
                cursor: pointer;
                box-sizing: border-box;
                max-width: 100%;
                display: inline-flex;
                //justify-content: center;
                background: #F5F5F5;
                color: #2D3B45;
                border: 1px solid #C7CDD1;
                border-radius: 3px;
                padding: 8px 12px;
                font-size: 1rem;
                font-family: 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-weight: normal;
                line-height: 1.5;
                text-decoration: none;
                transition: background-color 0.2s ease;
                text-align: left;
                width: stretch;
            }

            #sis-export-btn:hover {
                background: #EAEAEA;
            }

            #sis-export-btn:active {
                background: #D4D4D4;
            }

            #sis-export-btn:focus {
                outline: none;
                box-shadow: 0 0 0 2px #0374B5;
            }

            #sis-export-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background: #F5F5F5;
            }

            #sis-export-btn svg {
                width: 1em;
                height: 1em;
                margin-right: 8px;
                fill: currentColor;
            }

            #sis-log-panel {
                display: none;
                width: 450px;
                max-height: 400px;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 6px;
                margin-top: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                overflow: hidden;
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 9999;
            }

            #sis-log-header {
                background: #2D3B45;
                color: white;
                padding: 10px 15px;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            #sis-log-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0 5px;
            }

            #sis-log-content {
                padding: 10px;
                max-height: 300px;
                overflow-y: auto;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 12px;
                background: #1e1e1e;
                color: #d4d4d4;
            }.log-entry {
                padding: 4px 8px;
                margin: 2px 0;
                border-radius: 3px;
                word-wrap: break-word;
            }.log-info { color: #9CDCFE; }.log-success { color: #4EC9B0; background: rgba(78, 201, 176, 0.1); }.log-warning { color: #DCDCAA; background: rgba(220, 220, 170, 0.1); }.log-error { color: #F48771; background: rgba(244, 135, 113, 0.1); }.log-data { color: #CE9178; }

            #sis-progress-bar {
                height: 4px;
                background: #e0e0e0;
                width: 100%;
            }

            #sis-progress-fill {
                height: 100%;
                background: #0770A3;
                width: 0%;
                transition: width 0.3s ease;
            }

            #sis-status-badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 11px;
                margin-left: 10px;
            }.status-running { background: #FFC107; color: #000; }.status-success { background: #4CAF50; color: #fff; }.status-error { background: #F44336; color: #fff; }
        </style>
    `;

    // HTML for the button (styled to match Canvas InstUI buttons)
    const BUTTON_HTML = `
        <div id="sis-tool-container">
            <button id="sis-export-btn" type="button">
                <svg name="IconSis" viewBox="0 0 1920 1920" aria-hidden="true" role="presentation" focusable="false">
                    <g role="presentation">
                        <path d="M1129.412 0v112.94H112.94v1694.12h1694.12V338.824h112.94v1581.177H0V0h1129.412Zm-508.235 1242.353 315.294 315.294-79.85 79.85-315.295-315.295-315.294 315.294-79.85-79.849 315.295-315.294-315.294-315.295 79.849-79.849 315.294 315.294 315.295-315.294 79.849 79.85-315.294 315.294Zm987.294-225.882v112.94h-451.765v-112.94h451.765Zm0-338.824v112.941h-451.765V677.647h451.765Zm-56.471-564.706v395.294h-395.294V112.94H1552Zm-112.941 112.942h-169.412v169.411h169.412V225.882Z" fill-rule="evenodd"/>
                    </g>
                </svg>
                <span>  Clear UI Flags via SIS</span>
            </button>
        </div>
    `;

    // HTML for the log panel (separate, fixed position)
    const LOG_PANEL_HTML = `
        <div id="sis-log-panel">
            <div id="sis-log-header">
                <span>SIS Import Log <span id="sis-status-badge"></span></span>
                <button id="sis-log-close">×</button>
            </div>
            <div id="sis-progress-bar">
                <div id="sis-progress-fill"></div>
            </div>
            <div id="sis-log-content"></div>
        </div>
    `;

    // Logger class
    class Logger {
        constructor(containerSelector) {
            this.container = null;
            this.containerSelector = containerSelector;
        }

        init() {
            this.container = $(this.containerSelector);
        }

        log(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const entry = $(`<div class="log-entry log-${type}">[${timestamp}] ${message}</div>`);
            this.container.append(entry);
            this.container.scrollTop(this.container[0].scrollHeight);
            console.log(`[SIS Tool] [${type.toUpperCase()}] ${message}`);
        }

        info(msg) { this.log(msg, 'info'); }
        success(msg) { this.log(msg, 'success'); }
        warning(msg) { this.log(msg, 'warning'); }
        error(msg) { this.log(msg, 'error'); }
        data(msg) { this.log(msg, 'data'); }

        clear() {
            this.container.empty();
        }
    }

    // Main SIS Tool class
    class SISUserTool {
        constructor() {
            this.logger = new Logger('#sis-log-content');
            this.accountId = CONFIG.getAccountId();
            this.userId = CONFIG.getUserId();
            this.csrfToken = this.getCSRFToken();
        }

        getCSRFToken() {
            const token = $('meta[name="csrf-token"]').attr('content') ||
                          document.cookie.match(/(?:^|;\s*)_csrf_token=([^;]+)/)?.[1];
            return decodeURIComponent(token || '');
        }

        init() {
            // Inject styles
            $('head').append(STYLES);

            // Find the terminate sessions button mount point and insert our button after it
            const mountPoint = $('#terminate-sessions-mount-point');

            if (mountPoint.length) {
                // Insert button container directly after the terminate sessions mount point
                mountPoint.after(BUTTON_HTML);
                console.log('[SIS Tool] Button inserted after terminate-sessions-mount-point');
            } else {
                // Fallback: try to find the button by its text content
                const terminateButton = $('button:contains("Terminate all sessions")').closest('div[id]');
                if (terminateButton.length) {
                    terminateButton.after(BUTTON_HTML);
                    console.log('[SIS Tool] Button inserted after terminate button (fallback)');
                } else {
                    // Last resort: append to body with fixed positioning
                    console.warn('[SIS Tool] Could not find terminate sessions button, using fixed position');
                    $('body').append(`
                        <div id="sis-tool-container" style="position: fixed; top: 60px; right: 20px; z-index: 9999;">
                            <button id="sis-export-btn" type="button" style="background: #F5F5F5; color: #2D3B45; border: 1px solid #C7CDD1; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                                📤 Clear UI Flags via SIS Import
                            </button>
                        </div>
                    `);
                }
            }

            // Append log panel to body (fixed position)
            $('body').append(LOG_PANEL_HTML);

            this.logger.init();
            this.bindEvents();

            console.log('[SIS Tool] Initialized for user:', this.userId, 'in account:', this.accountId);
        }

        bindEvents() {
            $('#sis-export-btn').on('click', () => this.run());
            $('#sis-log-close').on('click', () => this.hideLog());
        }

        showLog() {
            $('#sis-log-panel').slideDown(200);
        }

        hideLog() {
            $('#sis-log-panel').slideUp(200);
        }

        setProgress(percent) {
            $('#sis-progress-fill').css('width', `${percent}%`);
        }

        setStatus(status, type) {
            const badge = $('#sis-status-badge');
            badge.text(status).removeClass('status-running status-success status-error').addClass(`status-${type}`);
        }

        setButtonState(disabled, text) {
            const btn = $('#sis-export-btn');
            btn.prop('disabled', disabled);
            if (text) {
                btn.find('span').text(text);
            }
        }

        /**
         * Map Canvas workflow_state to SIS import status
         * Canvas API returns: registered, pre_registered, deleted, creation_pending, etc.
         * SIS Import expects: active, deleted, suspended
         */
        mapWorkflowStateToSISStatus(workflowState) {
            const stateMap = {
                'registered': 'active',
                'pre_registered': 'active',
                'creation_pending': 'active',
                'pending_approval': 'active',
                'active': 'active',
                'deleted': 'deleted',
                'suspended': 'suspended',
                'inactive': 'deleted'
            };

            const mappedStatus = stateMap[workflowState?.toLowerCase()] || 'active';

            this.logger.info(`Workflow state "${workflowState}" mapped to SIS status "${mappedStatus}"`);

            return mappedStatus;
        }

        // Fetch user data from Canvas API
        async fetchUserData() {
            this.logger.info(`Fetching user data for user ID: ${this.userId}`);

            try {
                // Get basic user info
                const userResponse = await $.ajax({
                    url: `/api/v1/users/${this.userId}`,
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-Token': this.csrfToken
                    }
                });

                this.logger.info(`User found: ${userResponse.name}`);
                this.logger.data(`Canvas User ID: ${userResponse.id}`);
                this.logger.data(`Workflow State: ${userResponse.workflow_state || 'not specified'}`);

                // Get user's login info (pseudonyms) for this account
                const loginsResponse = await $.ajax({
                    url: `/api/v1/users/${this.userId}/logins`,
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-Token': this.csrfToken
                    }
                });

                // Find the login for this account
                const accountLogin = loginsResponse.find(login =>
                    login.account_id == this.accountId
                ) || loginsResponse[0];

                if (!accountLogin) {
                    throw new Error('No login found for this user in the current account');
                }

                this.logger.info(`Login ID: ${accountLogin.unique_id}`);
                this.logger.data(`SIS User ID: ${accountLogin.sis_user_id || 'Not set'}`);
                this.logger.data(`Login workflow_state: ${accountLogin.workflow_state || 'not specified'}`);

                // Determine user status - check both user and login workflow states
                // Prioritize login workflow_state if available, otherwise use user workflow_state
                const workflowState = accountLogin.workflow_state || userResponse.workflow_state || 'registered';
                const sisStatus = this.mapWorkflowStateToSISStatus(workflowState);

                const userData = {
                    user_id: accountLogin.sis_user_id || `canvas_${userResponse.id}`,
                    login_id: accountLogin.unique_id,
                    full_name: userResponse.name,
                    email: userResponse.email || accountLogin.unique_id,
                    status: sisStatus,
                    pronouns: userResponse.pronouns || ''
                };

                this.logger.success('User data retrieved successfully');
                this.logger.data(`Final status value: "${userData.status}"`);

                return userData;

            } catch (error) {
                this.logger.error(`Failed to fetch user data: ${error.message || error.statusText}`);
                throw error;
            }
        }

        // Generate CSV content
        generateCSV(userData) {
            this.logger.info('Generating CSV file...');

            const headers = ['user_id', 'login_id', 'full_name', 'email', 'status', 'pronouns'];

            // Escape CSV values
            const escapeCSV = (value) => {
                if (value === null || value === undefined) return '';
                const str = String(value);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            const headerRow = headers.join(',');
            const dataRow = headers.map(h => escapeCSV(userData[h])).join(',');
            const csvContent = `${headerRow}\n${dataRow}`;

            this.logger.data('CSV Content:');
            this.logger.data(`  ${headerRow}`);
            this.logger.data(`  ${dataRow}`);
            this.logger.success('CSV generated successfully');

            return csvContent;
        }

        // Create a Blob and File from CSV content
        createCSVFile(csvContent) {
            const blob = new Blob([csvContent], { type: 'text/csv' });
            return new File([blob], CONFIG.csvFilename, { type: 'text/csv' });
        }

        // Submit SIS Import
        async submitSISImport(csvFile) {
            this.logger.info('Submitting SIS Import...');
            this.logger.info('Setting clear_sis_stickiness and override_sis_stickiness to true');

            const formData = new FormData();
            formData.append('attachment', csvFile);
            formData.append('import_type', 'instructure_csv');
            formData.append('extension', 'csv');
            // This clears the "UI changed" flag
            formData.append('clear_sis_stickiness', 'true');
            // Process as a batch
            formData.append('batch_mode', 'false');
            // Override UI changes with SIS data
            formData.append('override_sis_stickiness', 'true');

            try {
                const response = await $.ajax({
                    url: `/api/v1/accounts/${this.accountId}/sis_imports`,
                    method: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    headers: {
                        'X-CSRF-Token': this.csrfToken
                    }
                });

                this.logger.success(`SIS Import created with ID: ${response.id}`);
                this.logger.data(`Import state: ${response.workflow_state}`);

                return response;

            } catch (error) {
                const errorMsg = error.responseJSON?.errors?.[0]?.message ||
                                 error.responseText ||
                                 error.statusText;
                this.logger.error(`SIS Import failed: ${errorMsg}`);
                throw error;
            }
        }

        // Poll for SIS Import status
        async pollImportStatus(importId) {
            this.logger.info(`Monitoring import status (ID: ${importId})...`);

            const maxAttempts = 60; // 5 minutes max
            let attempts = 0;

            while (attempts < maxAttempts) {
                attempts++;

                try {
                    const response = await $.ajax({
                        url: `/api/v1/accounts/${this.accountId}/sis_imports/${importId}`,
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-Token': this.csrfToken
                        }
                    });

                    const state = response.workflow_state;
                    const progress = response.progress || 0;

                    this.setProgress(30 + (progress * 0.7)); // Scale to 30-100%

                    if (state === 'imported' || state === 'imported_with_messages') {
                        this.logger.success(`Import completed successfully!`);

                        if (response.data?.counts) {
                            const counts = response.data.counts;
                            this.logger.data(`Users processed: ${counts.users || 0}`);
                        }

                        if (response.processing_warnings?.length > 0) {
                            response.processing_warnings.forEach(w => {
                                this.logger.warning(`Warning: ${w[1]}`);
                            });
                        }

                        return response;
                    }

                    if (state === 'failed' || state === 'failed_with_messages') {
                        const errors = response.processing_errors || [];
                        errors.forEach(e => this.logger.error(`Error: ${e[1]}`));
                        throw new Error('SIS Import failed');
                    }

                    if (state === 'aborted') {
                        throw new Error('SIS Import was aborted');
                    }

                    // Still processing
                    this.logger.info(`Status: ${state} (${progress}% complete)`);

                    // Wait 5 seconds before next poll
                    await new Promise(resolve => setTimeout(resolve, 5000));

                } catch (error) {
                    if (error.message && (error.message.includes('failed') || error.message.includes('aborted'))) {
                        throw error;
                    }
                    this.logger.warning(`Poll attempt ${attempts} failed, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }

            throw new Error('Import timed out after 5 minutes');
        }

        // Main execution flow
        async run() {
            this.logger.clear();
            this.showLog();
            this.setStatus('Running', 'running');
            this.setButtonState(true, '⏳ Processing...');
            this.setProgress(0);

            try {
                // Step 1: Fetch user data (0-20%)
                this.logger.info('=== Step 1: Fetching User Data ===');
                this.setProgress(5);
                const userData = await this.fetchUserData();
                this.setProgress(20);

                // Step 2: Generate CSV (20-25%)
                this.logger.info('=== Step 2: Generating CSV ===');
                const csvContent = this.generateCSV(userData);
                const csvFile = this.createCSVFile(csvContent);
                this.setProgress(25);

                // Step 3: Submit SIS Import (25-30%)
                this.logger.info('=== Step 3: Submitting SIS Import ===');
                const importResponse = await this.submitSISImport(csvFile);
                this.setProgress(30);

                // Step 4: Poll for completion (30-100%)
                this.logger.info('=== Step 4: Monitoring Import Progress ===');
                await this.pollImportStatus(importResponse.id);
                this.setProgress(100);

                // Success!
                this.setStatus('Complete', 'success');
                this.logger.success('=== Process Complete ===');
                this.logger.info('UI flags have been cleared for this user.');
                this.logger.info('You will need to run the GNumber through ILP Now.');

            } catch (error) {
                this.setStatus('Error', 'error');
                this.logger.error(`=== Process Failed ===`);
                this.logger.error(error.message || 'An unexpected error occurred');
            } finally {
                this.setButtonState(false, 'Clear UI Flags via SIS Import');
            }
        }
    }

    // Initialize when DOM is ready
    $(document).ready(function() {
        // Verify we're on the correct page
        if (!CONFIG.getUserId()) {
            console.log('[SIS Tool] Not on a user page, skipping initialization');
            return;
        }

        // Wait for Canvas to fully render (including React components)
        const waitForElement = (selector, maxAttempts = 20) => {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const check = () => {
                    attempts++;
                    const element = $(selector);
                    if (element.length) {
                        resolve(element);
                    } else if (attempts >= maxAttempts) {
                        resolve(null); // Resolve with null instead of rejecting
                    } else {
                        setTimeout(check, 250);
                    }
                };
                check();
            });
        };

        // Wait for the terminate sessions button to appear, then initialize
        waitForElement('#terminate-sessions-mount-point').then(() => {
            const tool = new SISUserTool();
            tool.init();
        });
    });

})();