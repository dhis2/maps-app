## Manage facility layers { #using_maps_facility_layer }

The facility layer displays icons that represent types of facilities. Polygons do not show up on the
map, so make sure that you select an organisation unit level that has facilities.

_A polygon is an enclosed area on a map representing a country, a district or a park._

![](../resources/images/maps_facility_layer.png)

Facility layers are represented by layer _cards_ in the layer panel such as:

Along the top of the facilities card from left to right are:

-   A grab field to allow dragging and re-ordering layers with the mouse

-   The **Facilities** title

-   An eye symbol for toggling the visibility of the layer

-   An arrow symbol to collapse and expand the facilities card

In the middle of the facilities card is a legend indicating the group set representation.

Along the bottom of the facilities card from left to right are:

-   An edit (pencil) button to open the layer configuration dialog

-   A slider for modifying the layer transparency

-   A more actions (three dots) button with additional options:

    -   A **Show/hide data table** toggle button to show or hide the data table associated with the
        layer

    -   **Download data** allows you to download the data for this layer in GeoJSON format for use
        in other mapping software

    -   **Edit layer** is the same as edit button above

    -   **Remove layer** will remove this layer from the current map.

### Create a facility layer

To create facility layer, choose **Facilities** on the **Add layer**selection. This opens the
Facility layer configuration dialog.

1.  In the **Organisation Units** tab

    ![](../resources/images/maps_facility_layer_dialog_ORG_UNITS.png)

    -   Select the organisation unit level(s) and/or group(s) from the selection fields on the right
        hand side.

    -   Select the organisation units you want to include in the layer. It is possible to select
        either

        -   One or more specific organisation units, or

        -   A relative level in the organisation unit hierarchy, with respect to the user. By
            selecting a **User organisation unit** the map data will appear differently for users at
            different levels in the organisation unit hierarchy.

    -   The system administrator can set the default organsation unit level containing facilities in
        the **System Settings** app.

    -   **Use associated geometry**: This dropdown will only show if there are any additional
        geometry available for your organisation units. This is typically used to show facility
        catchment areas.

2.  In the **Style** tab:

    ![](../resources/images/maps_facility_layer_dialog_STYLE.png)

    -   Select any styling you wish to apply to the facilities.

        -   Show labels

            Allows labels to be shown on the layer. Font size, weight and color can be modified
            here.

        -   Show buffer

            Allows a visual buffer to be displayed on the layer around each facility. The radius of
            the buffer can be modified here. Buffer option is not available if asscoiated geometry
            is used.

    -   Facilities can be styled an **organisation unit group set** using different icons. Select a
        group set from the list of organisation unit group sets defined for your DHIS2 instance. The
        system administrator can set the default organsation unit group set in the **System
        Settings** app.

    -   If no group set is selected, the facilities will be shown as filled circles. The color and
        the circle radius can be changed.

3.  Click **Add layer**.

### Create or modify a facility layer

1.  In the layer panel, click the edit (pencil) icon on the facility layer card.

2.  Modify the setting on the GROUP SET, ORGANISATION UNITS and STYLE tabs as desired.

3.  Click **Update layer**.

### Filter values in a facility layer

Facility layers have a **Show/hide data table** option that can be toggled on or off from the
facility layer card.

![](../resources/images/maps_facility_layer_data_table.png)

The data table displays the data forming the facility layer.

-   clicking on the up/down arrow will sort the table based on that column; toggling between
    ascending and descending.

-   entering text or expressions into the filter fields below the titles will apply those filters to
    the data, and the display will adjust according to the filter. The filters are applied as
    follows:

    -   NAME

        filter by name containing the given text

    -   ID

        filter by IDs containing the given text

    -   TYPE

        filter by GIS display types containing the given text

> **Note**
>
> Data table filters are temporary and are not saved with the map layers as part of the saved map.

### Search for a facility

The NAME filter field in the data table provides an effective way of searching for individual
facilities.

### Open organisation unit profile

You can open the [organisation unit profile](#using_maps_org_unit_profile) in three ways:

1. Click on any of the organisasjon units shown on the map, and click the **View profile** button in
   the popup.

2. Right-click one of the organisation units on the map, and select **View profile** from the menu.

3. Click on an organisation unit row in the **data table**.

### Remove facility layer

To clear all data in a facility layer:

1.  In the layer card to the left, click the _more actions_ (three dots) icon and then on **Remove
    layer**.

    The layer is removed from the current map.
