## Manage tracked entity layers { #using_maps_tracked_entity_layer }

The tracked entity layer displays the geographical location of tracked entities registered in DHIS2.
Tracked entities with associated point or polygon coordinates appear on the map.

![](../resources/images/maps_tracked_entity_layer.png)

Tracked entity layers are represented by layer cards in the layer panel. The middle of the card
shows a legend indicating the styling of the layer.

### Create a tracked entity layer { #maps_create_tracked_entity_layer }

To create a tracked entity layer, choose **Tracked entities** on the **Add layer** selection. This
opens the Tracked entity layer configuration dialog.

#### 1. Data

![](../resources/images/maps_tracked_entity_layer_dialog_DATA.png)

-   Select the **Tracked entity type** you want to show on the map.

-   Select a **Program** to filter tracked entities by enrollment.

-   Use the **Program status** field to select the enrollment status of tracked entities to include:
    All, Active, Completed, or Cancelled.

-   Filter by the **Follow-up** flag to include only tracked entities marked for follow-up.

#### 2. Relationships

![](../resources/images/maps_tracked_entity_layer_dialog_RELATIONSHIPS.png)

> **Caution**
>
> Displaying tracked entity relationships in Maps is an experimental feature.

-   Select the **Display tracked entity relationships** checkbox to show relationships on the map.

-   Select the **Relationship type** to display from the dropdown list. Only relationships defined
    for the selected tracked entity type are available.

#### 3. Period

![](../resources/images/maps_tracked_entity_layer_dialog_PERIOD.png)

-   If no program is selected, you can set start and end dates for when the tracked entities were
    last updated.

-   If a program is selected, you can set the period when tracked entities were last updated or when
    they were enrolled in the program.

#### 4. Org units

![](../resources/images/maps_tracked_entity_layer_dialog_ORG_UNITS.png)

-   Select the org units you want to include in the layer. Only specific org units can be selected.
    A **selection mode** determines how the org unit tree is traversed:

    -   **Selected only**: Include tracked entities belonging to selected org units only.

    -   **Selected and below**: Include tracked entities in and right below selected org units.

    -   **Selected and all below**: Include tracked entities in and all below selected org units.

#### 5. Style

![](../resources/images/maps_tracked_entity_layer_dialog_STYLE.png)

-   Select a **Color** for tracked entity points and polygons.

-   Select the **Point size** for the points.

-   Select **Buffer** to display a visual buffer around each tracked entity. The buffer distance in
    meters can be modified here.

-   If a relationship type has been selected on the Relationships tab, you can select a **Color**
    and **Point size** for related tracked entities and a **Line color** for the relationship lines.

Click **Add layer**.

### Modify a tracked entity layer

1.  In the layer panel, click the edit (pencil) icon on the tracked entity layer card.

2.  Modify the settings on the **Data**, **Relationships**, **Period**, **Org units** and **Style**
    tabs as desired.

3.  Click **Update layer**.

### Modify information in tracked entity popups

If you have access to the selected program in the Metadata Management app, you can modify the
information displayed in the tracked entity popup window.

![](../resources/images/maps_eventlayer_eventinfopopup.png)

1.  Open the **Metadata Management** app.

2.  Select **Program**.

3.  Click the program you want to modify and select **Enrollment: Data**.

4.  For every attribute you want to display in the popup window, enable **Display in list**.

5.  Click **Save**.

### Remove a tracked entity layer

To remove a tracked entity layer from the map, in the layer card to the left, click the _more
actions_ (three dots) icon and then click **Remove layer**.
