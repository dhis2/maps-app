import { EXTENDED_TIMEOUT } from "../support/util.js";

const preview = String(Cypress.env("preview"));

const THEMATIC = "MDfsQXA2VR1";
const SAVED_COLUMNS = "yYaagMvoVTE";
const TRACKED_ENTITIES = "NhDM6wSdwqM";

const openMap = (mapId) => {
  cy.visit(`/#/${mapId}`);
  // Visiting the same hash doesn't reload, and open menus would stay in the way
  cy.reload();
  cy.get("canvas", EXTENDED_TIMEOUT).should("be.visible");
  cy.wait(4000);
};

const openTable = (mapId = THEMATIC) => {
  openMap(mapId);
  cy.getByDataTest("moremenubutton").first().click();
  cy.contains('[data-test="more-menu"] li', "Show data table", EXTENDED_TIMEOUT)
    .should("not.have.class", "disabled")
    .click();
  cy.getByDataTest("bottom-panel")
    .findByDataTest("dhis2-uicore-datatablerow", EXTENDED_TIMEOUT)
    .should("have.length.greaterThan", 0);
  cy.wait(2500);
};

const unionRect = (els) => {
  const rects = els.map((el) => el.getBoundingClientRect());
  return {
    left: Math.min(...rects.map((r) => r.left)),
    top: Math.min(...rects.map((r) => r.top)),
    right: Math.max(...rects.map((r) => r.right)),
    bottom: Math.max(...rects.map((r) => r.bottom)),
  };
};

const closeAlerts = () =>
  cy.get("body").then(($b) => {
    const buttons = $b.find('[data-test="dhis2-uicore-alertbar-dismiss"]');
    if (buttons.length) {
      cy.wrap(buttons).click({ multiple: true, force: true });
      cy.wait(600);
    }
  });

const marks = [];

// Draws a red rectangle around all the given elements
const mark = (query) =>
  query.then(($els) => {
    const r = unionRect([...$els]);
    const pad = 4;
    cy.document().then((doc) => {
      const box = doc.createElement("div");
      box.className = "tmp-highlight";
      Object.assign(box.style, {
        position: "fixed",
        left: `${r.left - pad}px`,
        top: `${r.top - pad}px`,
        width: `${r.right - r.left + 2 * pad}px`,
        height: `${r.bottom - r.top + 2 * pad}px`,
        border: "3px solid #e5001c",
        borderRadius: "6px",
        boxShadow: "0 0 0 2px rgba(255,255,255,0.9)",
        zIndex: 2147483647,
        pointerEvents: "none",
        boxSizing: "border-box",
      });
      doc.body.appendChild(box);
      marks.push(r);
    });
  });

const clearMarks = () => {
  cy.document().then((doc) =>
    doc.querySelectorAll(".tmp-highlight").forEach((el) => el.remove())
  );
  cy.then(() => marks.splice(0));
};

// Screenshot cropped to the context element, or to the marks with a margin
const shoot = (name, { context, margin = { x: 160, y: 110 } } = {}) => {
  closeAlerts();
  const take = (r) =>
    cy.window().then((win) => {
      const x = Math.max(0, Math.floor(r.left - margin.x));
      const y = Math.max(0, Math.floor(r.top - margin.y));
      const right = Math.min(win.innerWidth, Math.ceil(r.right + margin.x));
      const bottom = Math.min(win.innerHeight, Math.ceil(r.bottom + margin.y));
      // Tooltips left open by the last click would cover the area
      const style = win.document.createElement("style");
      style.textContent =
        '[data-test="dhis2-uicore-tooltip-content"] { display: none !important; }';
      win.document.head.appendChild(style);
      cy.wait(300);
      cy.screenshot(name, {
        capture: "viewport",
        clip: { x, y, width: right - x, height: bottom - y },
        overwrite: true,
      });
      cy.then(() => style.remove());
    });
  if (context) {
    context.then(($els) => take(unionRect([...$els])));
  } else {
    cy.then(() =>
      take({
        left: Math.min(...marks.map((r) => r.left)),
        top: Math.min(...marks.map((r) => r.top)),
        right: Math.max(...marks.map((r) => r.right)),
        bottom: Math.max(...marks.map((r) => r.bottom)),
      })
    );
  }
  clearMarks();
};

const panel = () => cy.getByDataTest("bottom-panel");
const headerCells = () =>
  panel().find('[data-test="dhis2-uicore-datatablecellhead"]');
const firstColumn = () =>
  panel().then(($p) => {
    const cells = [
      $p[0].querySelector('[data-test="dhis2-uicore-datatablecellhead"]'),
      ...$p[0].querySelectorAll(
        '[data-test="dhis2-uicore-tablebody"] tr td:first-child'
      ),
    ].filter(Boolean);
    return cy.wrap(cells);
  });
const toolbar = () => panel().find('button[aria-label="Collapse"]').parent();

const mapMenu = () => {
  cy.get("canvas")
    .first()
    .then(($c) => {
      cy.get("canvas")
        .first()
        .rightclick($c.width() / 2, $c.height() / 2);
    });
  return cy.getByDataTest("context-menu", EXTENDED_TIMEOUT);
};

const hierarchyFilter = () => {
  cy.getByDataTest("layers-toggle-button").click();
  cy.getByDataTest("data-table-column-filter-search-Org unit hierarchy")
    .find("input")
    .focus();
  cy.wait(1500);
  return hierarchyPopover();
};
const hierarchyPopover = () =>
  cy
    .getByDataTest("data-table-column-filter-any-Org unit hierarchy")
    .closest('[data-test="dhis2-uicore-popper"]');

const columnList = () => {
  cy.getByDataTest("data-table-column-picker-button").click();
  cy.getByDataTest("data-table-column-picker-select-all").should("exist");
  // The button's tooltip opens after a delay and would cover the list
  cy.wait(800);
  cy.getByDataTest("data-table-column-picker-button")
    .trigger("mouseout", { force: true })
    .trigger("mouseleave", { force: true });
  cy.wait(500);
};
const columnListPopover = () =>
  cy
    .getByDataTest("data-table-column-picker-select-all")
    .closest('[data-test="dhis2-uicore-popper"]');

const layerMenu = () => {
  cy.getByDataTest("moremenubutton").first().click();
  return cy.getByDataTest("more-menu", EXTENDED_TIMEOUT);
};

const DRILL = "OFjbKmUcffK";

const showLayersPanel = () =>
  cy.get("body").then(($b) => {
    if (!$b.find('[data-test="sortable-layers-list"]:visible').length) {
      cy.getByDataTest("layers-toggle-button").click();
      cy.wait(800);
    }
  });

// The elements of the app's document matching the selectors, for a crop
const appElements = (...selectors) =>
  cy
    .document()
    .then((doc) => selectors.map((selector) => doc.querySelector(selector)));

const drillDown = () => {
  mapMenu();
  cy.getByDataTest("context-menu-drill-down").click();
  cy.wait(6000);
};

// Moves the top layer one place down with the keyboard, as dnd-kit allows
const moveTopLayerDown = () => {
  cy.getByDataTest("sortable-handle").first().focus().type(" ");
  cy.wait(400);
  cy.focused().type("{downarrow}");
  cy.wait(400);
  cy.focused().type(" ");
  cy.wait(3000);
};

const layerCards = () => cy.getByDataTest("sortable-layers-list");

const drillShots = (prefix) => {
  openMap(DRILL);
  showLayersPanel();
  drillDown();
  moveTopLayerDown();
  // Collapsed cards fit both layers in the shot
  cy.getByDataTest("sortable-handle").each(($handle) =>
    cy.wrap($handle).next().click()
  );
  cy.wait(800);
  mark(layerCards());
  shoot(`${prefix}-order`, {
    context: appElements("canvas", '[data-test="layers-panel"]'),
    margin: { x: 0, y: 0 },
  });
  openMap(DRILL);
  showLayersPanel();
  drillDown();
  layerMenu();
  cy.contains('[data-test="more-menu"] li', "Show data table").click();
  panel()
    .findByDataTest("dhis2-uicore-datatablerow", EXTENDED_TIMEOUT)
    .eq(2)
    .as("row");
  cy.wait(2500);
  cy.get("@row").trigger("mouseover").trigger("mouseenter");
  cy.wait(1000);
  mark(cy.get("@row"));
  shoot(`${prefix}-hover`, {
    context: appElements("canvas", '[data-test="bottom-panel"]'),
    margin: { x: 0, y: 0 },
  });
};

const EMPTY_EVENTS = "DS4XR7xWOt9";

const emptyLayerShot = (name) => {
  openMap(EMPTY_EVENTS);
  layerMenu();
  cy.contains('[data-test="more-menu"] li', "Show data table").click();
  cy.wait(4000);
  mark(panel());
  shoot(name, { context: appElements("body"), margin: { x: 0, y: 0 } });
};

const shots = {
  3832: () => drillShots("3838-before"),
  3838: () => {
    drillShots("3838-after");
    emptyLayerShot("3839-before");
  },
  3839: () => emptyLayerShot("3839-after"),
  3817: () => {
    openTable();
    cy.getByDataTest("data-table-selection-filter-button").click();
    cy.wait(600);
    mark(
      cy
        .contains("Not selected")
        .closest('[data-test="dhis2-uicore-popper"]')
        .then(($p) =>
          $p.add('[data-test="data-table-selection-filter-button"]')
        )
    );
    shoot("3818-before");
  },
  3818: () => {
    openTable();
    mark(headerCells().first());
    shoot("3818-after", { context: panel() });
    mark(firstColumn());
    shoot("3819-before", { context: panel() });
  },
  3819: () => {
    openTable();
    mark(firstColumn());
    shoot("3819-after", { context: panel() });
    openMap(THEMATIC);
    mapMenu();
    mark(cy.getByDataTest("context-menu-zoom-to-selected"));
    shoot("3820-before", { context: cy.getByDataTest("context-menu") });
  },
  3820: () => {
    openMap(THEMATIC);
    mark(mapMenu());
    shoot("3820-after", { context: cy.getByDataTest("context-menu") });
    openTable();
    panel().findByDataTest("dhis2-uicore-datatablerow").eq(1).rightclick();
    mark(cy.getByDataTest("data-table-context-menu", EXTENDED_TIMEOUT));
    shoot("3821-before-row-menu", {
      context: cy.getByDataTest("data-table-context-menu"),
    });
    openMap(THEMATIC);
    mapMenu();
    mark(
      cy.get(
        '[data-test="context-menu-zoom-to-feature"], [data-test="context-menu-zoom-to-layer"]'
      )
    );
    shoot("3821-before-map-menu", {
      context: cy.getByDataTest("context-menu"),
    });
  },
  3821: () => {
    openMap(THEMATIC);
    mark(mapMenu());
    shoot("3821-after", { context: cy.getByDataTest("context-menu") });
    openTable();
    mark(hierarchyFilter());
    shoot("3822-before", { context: hierarchyPopover() });
  },
  3822: () => {
    openTable();
    mark(hierarchyFilter());
    shoot("3822-after", { context: hierarchyPopover() });
    cy.get("body").type("{esc}");
    openTable();
    mark(cy.getByDataTest("data-table-global-search"));
    mark(
      panel().find(
        'button[aria-label="Show only features in current map view"]'
      )
    );
    shoot("3823-before", { context: toolbar() });
  },
  3823: () => {
    openTable();
    mark(
      cy.get(
        '[data-test="bottom-panel"] button[aria-label="Clear filters"], [data-test="bottom-panel"] button[aria-label="Close"]'
      )
    );
    shoot("3823-after", { context: toolbar() });
    mark(panel().find('input[type="color"]').parent());
    shoot("3824-before", { context: toolbar() });
  },
  3824: () => {
    openTable();
    mark(
      cy.get(
        '[data-test="bottom-panel"] button[aria-label="Collapse"], [data-test="data-table-column-picker-button"]'
      )
    );
    shoot("3824-after", { context: toolbar() });
  },
  3825: () => {
    openTable();
    columnList();
    mark(cy.get('[data-test^="data-table-column-picker-pin-"]'));
    shoot("3826-before", { context: columnListPopover() });
  },
  3826: () => {
    openTable();
    columnList();
    mark(cy.get('[data-test^="data-table-column-picker-visible-"]'));
    shoot("3826-after", { context: columnListPopover() });
    cy.get("body").click(1100, 200);
    openTable(SAVED_COLUMNS);
    mark(headerCells());
    shoot("3827-before", { context: panel() });
  },
  3827: () => {
    openTable(SAVED_COLUMNS);
    mark(headerCells());
    shoot("3827-after", { context: panel() });
    openMap(TRACKED_ENTITIES);
    layerMenu();
    mark(cy.contains('[data-test="more-menu"] li', "Show data table"));
    shoot("3828-before", { context: cy.getByDataTest("more-menu") });
  },
  3828: () => {
    openMap(TRACKED_ENTITIES);
    mark(layerMenu());
    shoot("3828-after", { context: cy.getByDataTest("more-menu") });
  },
};

describe(`DHIS2-21456 screenshots from pr-${preview}`, () => {
  it("takes the screenshots", () => {
    // Matches the browser window, so screenshots don't scroll the app under the highlights
    cy.viewport(1280, 720);
    shots[preview]();
  });
});
