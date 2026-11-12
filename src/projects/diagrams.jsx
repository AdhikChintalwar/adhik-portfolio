// Drawings that are too specific for the generic blocks. A project page can show one with { t: 'diagram', id: '<name>' }.
// (Most diagrams use the generic { t: 'layers' } block instead, which needs no code, only data.)
import React from 'react';

// MediCoreRx: the system drawn in HTML and CSS (sharp at any size, wraps to one column on a phone)
function MediCoreRxDiagram() {
  return (
    <figure className="arch">
      <div className="arch-fb">
        <span className="arch-tag">Firebase</span>
        <div className="arch-apps">
          <div className="arch-node"><b>Admin app</b><small>Wholesaler ERP</small></div>
          <div className="arch-node"><b>Platform app</b><small>Operations team</small></div>
          <div className="arch-node"><b>Ordering app</b><small>Pharmacy portal</small></div>
          <div className="arch-node dim"><b>Marketing site</b><small>Static landing page</small></div>
        </div>
        <p className="arch-note"><strong>Hosting</strong> serves all four apps. <strong>Auth</strong> signs in admin, platform and ordering users (phone, email, Google).</p>
      </div>

      <div className="arch-lower">
        <div className="arch-wires"><span><i>REST + JWT</i></span><span><i>REST + JWT</i></span></div>
        <div className="arch-az">
          <span className="arch-tag">Azure App Service · Linux containers</span>
          <div className="arch-apis">
            <div className="arch-node wide"><b>Admin API</b><small>Express: sales, purchases, batches, parties, reports, platform routes, representative sessions</small><em>Used by the Admin and Platform apps</em></div>
            <div className="arch-node"><b>Ordering API</b><small>Express, CORS-locked to the ordering domains</small><em>Used by the Ordering app</em></div>
          </div>
        </div>
        <div className="arch-wires one"><span><i>SQL</i></span></div>
        <div className="arch-node arch-db"><b>SQL Server</b><small>Azure SQL in production. One shared database, with <code>organisation_id</code> on tenant rows.</small></div>
      </div>
      <figcaption>The production setup. The Azure environment has since been shut down; the same stack runs locally with Docker Compose.</figcaption>
    </figure>
  );
}

export const DIAGRAMS = { medicorerx: MediCoreRxDiagram };
