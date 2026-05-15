## Manage tracked entity layers { #using_maps_tracked_entity_layer }

The tracked entity layer displays the geographical location of tracked entities registered in the
DHIS2. Provided that tracked entities have associated point or polygon coordinates, you can explore
these on a map.

![](../resources/images/maps_tracked_entity_layer.png)

Tracked entity layers are represented by layer cards in the layer panel such as:

Along the top of the tracked entity card from left to right are:

-   A grab field to allow dragging and re-ordering layers with the mouse.

-   The title and period associated with the layer.

-   An arrow symbol to collapse and expand the tracked entity card.

In the middle of the tracked entity card is a legend indicating the styling of the layer.

Along the bottom of the tracked entity card from left to right are:

-   An edit (pencil) button to open the layer configuration dialog

-   An eye symbol for toggling the visibility of the layer

-   A slider for modifying the layer transparency

-   A more actions (three dots) button with additional options:

    -   **Edit layer** is the same as edit button above

    -   **Remove layer** will remove this layer from the current map.

### Create a tracked entity layer { #maps_create_tracked_enity_layer }

To create an tracked entity layer, choose **Tracked entities** on the **Add layer** selection. This
opens the Tracked entity layer configuration dialog.

1.  In the **Data** tab:

    ![](../resources/images/maps_tracked_entity_layer_dialog_DATA.png)

    -   Select the **Tracked Entity Type** you want to show on the map.

    -   Select a **Program** where the tracked entities belong.

    -   Use the **Program status** field to select the enrollment status of tracked entities to
        include: All, Active, Completed or Cancelled.

    -   Set the **Follow up** status of the tracked entity for the given program.

2.  In the **Relationships** tab

    ![](../resources/images/maps_tracked_entity_layer_dialog_RELATIONSHIPS.png)

    > **Caution**
    >
    > Displaying tracked entity relationships in Maps is an experimental feature

    -   If a Tracked Entity Type with relationships has been selected, you can select the **Display
        Tracked Entity relationships** checkbox

    -   Once checked, you can select the type of relationship to display on the map from the
        dropdown list. Only relationships from the selected Tracked Entity type are available.

3.  In the **Period** tab

    ![](../resources/images/maps_tracked_entity_layer_dialog_PERIOD.png)

    -   If no program is selected, you can set start and end dates when the tracked entities were
        last updated.

    -   If a program is selected, you can set the period when tracked entities were last updated or
        when they were registered or enrolled in the program.

4.  In the **Org Units** tab:

    ![](../resources/images/maps_tracked_entity_layer_dialog_ORG_UNITS.png)

    -   Select the organisation units you want to include in the layer. You have 3 selection modes:

        -   **Selected only**: Include tracked entities belonging to selected org units only.

        -   **Selected and below**: Included tracked entities in and right below selected org units.

        -   **Selected and all below**: Included tracked entities in and all below selected org
            units.

5.  In the **Style** tab:

    ![](../resources/images/maps_tracked_entity_layer_dialog_STYLE.png)

    -   Select a **color** for the tracked entities points and polygons.

    -   Select the **point size** (radius between 1 and 20) for the points.

    -   Select **Show buffer** to display visual buffer around each tracked entity. The buffer
        distance in meters can be modified here.

    -   If a relationship type has been selected on the relationships tab you can select **color**,
        **point size**, and **line color** for relationships and related tracked entities instances

6.  Click **Add/Update layer**.

### Modify a tracked entity layer

1.  In the layer panel, click the edit (pencil) icon on the tracked entity layer card.

2.  Modify the setting on the DATA, PERIOD, ORG UNIT and STYLE tabs as desired.

3.  Click **Update layer**.

### Modify information in tracked entity popups

If you have access to the selected program in the Maintenance app, you can modify the information
displayed in the tracked entity pop-up window.

![](../resources/images/maps_eventlayer_eventinfopopup.png)

1.  Open the **Maintenance** app.

2.  Select **Program**.

3.  Click the program you want to modify and select **(3) Attributes**.

4.  For every attribute you want to display in the pop-up window, select corresponding **Display in
    list**.

5.  Click **Save**.

### Clear a tracked entity layer

To clear a tracked entity layer from a map:

1.  In the layer card to the left, click the _more actions_ (three dots) icon and then on **Remove
    layer**.

    The layer is removed from the current map.
