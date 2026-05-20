## Manage org unit layers { #using_maps_org_unit_layer }

The org unit layer displays the borders and locations of your org units. This layer is particularly
useful if you are offline and don't have access to background maps.

![](../resources/images/maps_org_unit_layer.png)

Org unit layers are represented by layer cards in the layer panel. The more actions (three dots)
button includes options to show or hide the data table and to download the data in GeoJSON format.

### Create an org unit layer

To create an org unit layer, choose **Org units** on the **Add layer** selection. This opens the Org
unit layer configuration dialog.

#### 1. Org units

![](../resources/images/maps_org_unit_layer_dialog_ORG_UNITS.png)

-   Select org unit levels and/or groups from the selection fields on the right-hand side.

-   Select the org units you want to include in the layer. It is possible to select either

    -   One or more specific org units, or

    -   A relative level in the org unit hierarchy, with respect to the user. By selecting a **User
        org unit** the map data will appear differently for users at different levels in the org
        unit hierarchy.

-   **Use associated geometry**: This dropdown will only show if there are any additional geometries
    available for your org units. This is typically used to show facility catchment areas.

#### 2. Style

![](../resources/images/maps_org_unit_layer_dialog_STYLE.png)

-   **Labels**: Allows labels to be shown on the layer. Font style can be modified here.

-   **Boundary color**: Allows the boundary or outline color of the org units to be changed.

-   **Point radius**: Sets the base radius when point type elements, such as facilities, are
    presented on the org unit layer.

-   **Count org units without coordinates**: Org units without coordinates are counted and shown in
    a **Data quality** section of the legend. They also appear in the data table.

-   Org units with coordinates can be styled with an **org unit group set** using different colors.
    Select a group set from the list of org unit group sets defined for your DHIS2 instance.

    **Include unclassified org units**: Org units not belonging to any group in the selected group
    set are shown with a configurable color and label (default: "Unclassified").

Click **Add layer**.

### Modify an org unit layer

1.  In the layer panel, click the edit (pencil) icon on the org unit layer card.

2.  Modify the settings on the **Org units** and **Style** tabs as desired.

3.  Click **Update layer**.

### Filter values in an org unit layer

Org unit layers have a **Show/hide data table** option that can be toggled on or off from the org
unit layer card.

![](../resources/images/maps_bound_layer_data_table.png)

The data table displays the data associated with the org unit layer. Click the arrow buttons in a
column header to sort by that column. Type in the filter fields below each column header to filter
the displayed rows. The name filter field is an effective way to search for individual org units.

The level column supports numeric filtering using comparison operators: `>`, `<`, `>=`, and `<=`,
with `,` for OR and `&` for AND logic — for example: `2,>3&<8`.

> **Note**
>
> Data table filters are temporary and are not saved with the map.

### Open org unit profile

You can open the [org unit profile](#using_maps_org_unit_profile) in three ways:

1. Click an org unit on the map, then click the **View profile** button in the popup.

2. Right-click one of the org units on the map, and select **View profile** from the menu.

3. Click an org unit row in the **data table**.

### Navigate between org unit hierarchies

When there are visible org units on the map, you can navigate up and down in the hierarchy without
changing the org unit selection.

1.  Right-click one of the org units.

2.  Select **Drill up one level** or **Drill down one level**.

    The drill down option is disabled if you are on the lowest level. Likewise, the drill up option
    is disabled from the highest level.

### Remove an org unit layer

To remove an org unit layer from the map, in the layer card to the left, click the _more actions_
(three dots) icon and then click **Remove layer**.
