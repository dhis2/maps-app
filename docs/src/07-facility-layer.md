## Manage facility layers { #using_maps_facility_layer }

The facility layer displays icons representing types of facilities. Only point-type org units are
shown - polygon org units such as districts or regions are not displayed.

![](../resources/images/maps_facility_layer.png)

Facility layers are represented by layer cards in the layer panel. The middle of the card shows a
legend indicating the group set representation. The more actions (three dots) button includes
options to show or hide the data table and to download the data in GeoJSON format.

### Create a facility layer

To create a facility layer, choose **Facilities** on the **Add layer** selection. This opens the
Facility layer configuration dialog.

#### 1. Org units

![](../resources/images/maps_facility_layer_dialog_ORG_UNITS.png)

-   Select the org units you want to include in the layer. You can freely combine specific org
    units, org unit levels, org unit groups, and relative user org units (**User organisation
    unit**, **User sub-units**, **User sub-x2-units**). When user org units are selected, the map
    data will appear according to the assigned org units for each user in the org unit hierarchy.
    Only org units with a point location are displayed.

    > **Tip**: Levels and groups act as filters within the org units you select - combining them
    > will show only org units at those levels or in those groups that are descendants of your
    > selected org units.

-   The system administrator can set the default org unit level containing facilities in the
    **System Settings** app.

-   **Use associated geometry**: This dropdown will only show if there are any additional geometries
    available for your org units. This is typically used to show facility catchment areas.

#### 2. Style

![](../resources/images/maps_facility_layer_dialog_STYLE.png)

-   **Labels**: Allows labels to be shown on the layer. Font size, weight and color can be modified
    here.

-   **Buffer**: Displays a visual buffer around each facility. The radius of the buffer can be
    modified here. Not available if associated geometry is used.

-   **Count org units without a point location**: Org units without point coordinates are counted
    and shown in a **Data quality** section of the legend. They also appear in the data table.

-   Facilities with a point location can be styled with an **org unit group set** using different
    icons. Select a group set from the list of org unit group sets defined for your DHIS2 instance.
    The system administrator can set the default org unit group set in the **System Settings** app.

    **Include unclassified org units**: Org units not belonging to any group in the selected group
    set are shown with a configurable color and label (default: "Unclassified").

-   If no group set is selected, the facilities will be shown as filled circles. The color and
    radius can be changed.

Click **Add layer**.

### Modify a facility layer

1.  In the layer panel, click the edit (pencil) icon on the facility layer card.

2.  Modify the settings on the **Org units** and **Style** tabs as desired.

3.  Click **Update layer**.

### Filter values in a facility layer

Facility layers have a **Show/hide data table** option that can be toggled on or off from the
facility layer card.

![](../resources/images/maps_facility_layer_data_table.png)

The data table displays the data associated with the facility layer. Click the arrow buttons in a
column header to sort by that column. Type in the filter fields below each column header to filter
the displayed rows. The name filter field is an effective way to search for individual facilities.

> **Note**
>
> Data table filters are temporary and are not saved with the map.

### Open org unit profile

You can open the [org unit profile](#using_maps_org_unit_profile) in three ways:

1. Click an org unit on the map, then click the **View profile** button in the popup.

2. Right-click one of the org units on the map, and select **View profile** from the menu.

3. Click an org unit row in the **data table**.

### Remove a facility layer

To remove a facility layer from the map, in the layer card to the left, click the _more actions_
(three dots) icon and then click **Remove layer**.
