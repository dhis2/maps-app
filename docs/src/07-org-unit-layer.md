## Manage org unit layers { #using_maps_org_unit_layer }

The org unit layer displays the borders and locations of your organisation units. This layer is
particularly useful if you are offline and don't have access to background maps.

![](../resources/images/maps_org_unit_layer.png)

Org unit layers are represented by layer _cards_ in the layer panel such as:

Along the top of the org unit card from left to right are:

-   A grab field to allow dragging and re-ordering layers with the mouse

-   The **Organisation unit** title

-   An arrow symbol to collapse and expand the org unit card

Along the bottom of the org unit card from left to right are:

-   An edit (pencil) button to open the layer configuration dialog

-   An eye symbol for toggling the visibility of the layer

-   A slider for modifying the layer transparency

-   A more actions (three dots) button with additional options:

    -   A **Show/hide data table** toggle button to show or hide the data table associated with the
        layer

    -   **Download data** allows you to download the data for this layer in GeoJSON format for use
        in other mapping software

    -   **Edit layer** is the same as edit button above

    -   **Remove layer** will remove this layer from the current map.

### Create an org unit layer

To create an org unit layer, choose **Org units** on the **Add layer** selection. This opens the org
unit layer configuration dialog.

1.  In the **ORGANISATION UNITS** tab

    ![](../resources/images/maps_org_unit_layer_dialog_ORG_UNITS.png)

    -   select the organisation unit level(s) and/or group(s) from the selection fields on the right
        hand side.

    -   Select the organisation units you want to include in the layer. It is possible to select
        either

        -   One or more specific organisation units, or

        -   A relative level in the organisation unit hierarchy, with respect to the user. By
            selecting a **User organisation unit** the map data will appear differently for users at
            different levels in the organisation unit hierarchy.

    -   **Use associated geometry**: This dropdown will only show if there are any additional
        geometry available for your organisation units. This is typically used to show facility
        catchment areas.

2.  In the **Style** tab:

    ![](../resources/images/maps_org_unit_layer_dialog_STYLE.png)

    -   select any styling you wish to apply to the org unitss.

        -   Labels

            Allows labels to be shown on the layer. Font style can be modified here.

        -   Boundary color

            Allows the boundary or outline color of the organisation units to be changed.

        -   Point radius

            Sets the base radius when point type elements, such as facilities, are presented on the
            org unit layer.

    -   Organisation units can be styled an **organisation unit group set** using different colors.
        Select a group set from the list of organisation unit group sets defined for your DHIS2
        instance.

3.  Click **Add layer**.

### Modify an org unit layer

1.  In the layer panel, click the edit (pencil) icon on the org unit layer card.

2.  Modify the setting on the ORGANISATION UNITS and STYLE tabs as desired.

3.  Click **Update layer**.

### Filter values in an org unit layer

Org unit layers have a **Show/hide data table** option that can be toggled on or off from the org
unit layer card.

![](../resources/images/maps_bound_layer_data_table.png)

The data table displays the data forming the org unit layer.

-   clicking on a title will sort the table based on that column; toggling between ascending and
    descending.

-   entering text or expressions into the filter fields below the titles will apply those filters to
    the data, and the display will adjust according to the filter. The filters are applied as
    follows:

    -   NAME

        filter by name containing the given text

    -   LEVEL

        filter level by numbers and/or ranges, for example: 2,\>3&\<8

    -   PARENT

        filter by parent names containing the given text

    -   ID

        filter by IDs containing the given text

    -   TYPE

        filter by GIS display types containing the given text

> **Note**
>
> Data table filters are temporary and are not saved with the map layers as part of the saved map.

### Search for an organisational unit

The NAME filter field in the data table provides an effective way of searching for individual
organisational units displayed in the org unit layer.

### Open organisation unit profile

You can open the [organisation unit profile](#using_maps_org_unit_profile) in three ways:

1. Click on any of the organisasjon units shown on the map, and click the **View profile** button in
   the popup.

2. Right-click one of the organisation units on the map, and select **View profile** from the menu.

3. Click on an organisation unit row in the **data table**.

### Navigate between organisation hierarchies

You can modify the target of the org unit layer in the hierarchy without using the level/parent user
interface.

1.  Right-click one of the organisation units.

2.  Select **Drill up one level** or **Drill down one level**.

    The drill down option is disabled if you are on the lowest level. Likewise the drill up option
    is disabled from the highest level.

### Remove org unit layer

To clear all data in an org unit layer:

1.  In the layer card to the left, click the _more actions_ (three dots) icon and then on **Remove
    layer**.

    The layer is removed from the current map.
