import { Property, properties } from "./properties";

/**
 * Seed listings shown to students on first load and available via the
 * "Seed Demo Listings" button in the admin / landlord tools panel.
 *
 * Re-exported from properties.ts so the server-side AI matching endpoint
 * and the client-side listing feed stay in sync.
 */
export const studentDemoProperties: Property[] = properties;

