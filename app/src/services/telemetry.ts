import posthog from 'posthog-js';
import { APP_VERSION } from '../version';

/**
 * Servicio de Telemetría Robusto (v5.7)
 * Sincronizado con el Dashboard de Telemetría.
 */
class TelemetryManager {
    private isInitialized = false;
    private queue: { event: string, props: any }[] = [];
    private machineId: string = '';

    public async init() {
        if (this.isInitialized) return;

        try {
            const ipc = (window as any).ipcRenderer;
            
            if (ipc?.getMachineId) {
                const id = await ipc.getMachineId().catch(() => null);
                if (id) {
                    this.machineId = id;
                }
            }

            if (!this.machineId) {
                this.machineId = 'anon-' + Math.random().toString(36).substring(2, 10);
            }
            
            posthog.init('phc_nwRvFff4tcRi3cd4TGYGTENGHzBRphkFNqKW6p4PXPxx', {
                api_host: 'https://us.i.posthog.com',
                person_profiles: 'identified_only',
                capture_pageview: true,
                autocapture: false,
                persistence: 'memory',
                bootstrap: {
                    distinctID: this.machineId
                }
            });

            posthog.identify(this.machineId);
            this.isInitialized = true;
            this.flushQueue();
            this.trackAppStart();
        } catch (err) {
            console.error('[Telemetry-Renderer] Critical Init Failure:', err);
            this.isInitialized = true; 
        }
    }

    private flushQueue() {
        if (!this.isInitialized) return;
        while (this.queue.length > 0) {
            const item = this.queue.shift();
            if (item) this.capture(item.event, item.props);
        }
    }

    private capture(event: string, props: any) {
        if (!this.isInitialized) {
            this.queue.push({ event, props });
            return;
        }

        try {
            posthog.capture(event, {
                ...props,
                app_version: APP_VERSION,
                platform: navigator.platform,
                environment: import.meta.env.MODE || 'production',
                // Actualizar propiedades de la persona para el Dashboard
                $set: {
                    version: APP_VERSION,
                    os: navigator.platform,
                    ...(props.gpu ? { gpu: props.gpu } : {})
                }
            });
        } catch (e) {
            console.warn('[Telemetry-Renderer] Capture Failed:', e);
        }
    }

    private async trackAppStart() {
        const ipc = (window as any).ipcRenderer;
        let gpu = 'N/A';
        
        if (ipc?.getGpuInfo) {
            gpu = await ipc.getGpuInfo().catch(() => 'N/A');
        }

        this.capture('app_start', {
            gpu,
            machineId: this.machineId
        });
    }

    public trackPerformance(metric: string, value: number, context: Record<string, any> = {}) {
        this.capture('app_performance', { metric, value, ...context });
    }

    public trackError(error: Error, fatal: boolean = false) {
        this.capture('exception', {
            message: error?.message || 'Unknown Error',
            name: error?.name || 'Error',
            stack: error?.stack?.substring(0, 1000),
            fatal
        });
        
        try { posthog.capture('_flush'); } catch(e) {}
    }

    public trackFeatureUse(featureName: string) {
        this.capture('feature_usage', { feature: featureName });
    }

    public trackSecurity(event: string, status: string, details: any = {}) {
        this.capture('security_audit', { event, status, ...details });
    }
}

export const TelemetryService = new TelemetryManager();
