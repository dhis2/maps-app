## Manage thematic layers { #using_maps_thematic_layer }

_Thematic maps_ represent spatial variation of geographic distributions. Select your desired
combination of indicator/data element, period and organisation unit level. If your database has
coordinates and aggregated data values for these organisation units, they will appear on the map.

> **Note**
>
> You must generate the DHIS2 analytics tables to have aggregated data values available.

![](../resources/images/maps_thematic_mapping.png)

Thematic layers are represented by layer _cards_ in the layer panel such as:

Along the top of the thematic card from left to right are:

-   A grab field to allow dragging and re-ordering layers with the mouse

-   The title and period associated with the layer

-   An arrow symbol to collapse and expand the thematic card

In the middle of the thematic card is a legend indicating the value ranges displayed on the layer.

Along the bottom of the thematic card from left to right are:

-   An edit (pencil) button to open the layer configuration dialog

-   An eye symbol for toggling the visibility of the layer

-   A slider for modifying the layer transparency

-   A more actions (three dots) button with additional options:

    -   A **Show/hide data table** toggle button to show or hide the data table associated with the
        layer

    -   **Open as chart** will open this thematic data as a chart in the Data Visualizer app

    -   **Download data** allows you to download the data for this layer in GeoJSON format for use
        in other mapping software

    -   **Edit layer** is the same as edit button above

    -   **Remove layer** will remove this layer from the current map.

### Create a thematic layer

To create a thematic layer, choose **Thematic** on the **Add layer** selection. This opens the
Thematic layer configuration dialog.

1.  In the **Data** tab:

    ![](../resources/images/maps_thematic_layer_dialog_DATA.png)

    -   Select a data item.

    -   Select a value from the **Aggregation type** field for the data values to be shown on the
        map. By default, "By data element" is selected. Alternative values are: Count; Average; Sum;
        Standard deviation; Variance; Min; Max. See also
        [Aggregation operators](https://dhis2.github.io/dhis2-docs/master/en/user/html/ch10s05.html#d0e8082).

    -   **Only show completed events**: Includes only completed events in the aggregation process.
        This is useful when you want to exclude partial events in indicator calculations. Available
        for indicators, program indictors and event data items.

2.  In the **Period** tab

    ![](../resources/images/maps_thematic_layer_dialog_PERIOD.png)

    Select the time span over which the thematic data is mapped.

    -   **Period display mode** - Select how the selected periods will be visualized on the map:

        -   _Single_ (default)

            Displays all selected periods as a single combined layer with aggregated data. (Required
            when only one period is selected or when using start–end dates.)

        -   _Timeline_

            Displays multiple periods as an interactive timeline ordered chronologically. Multiple
            timeline layers can be added to a map (they will all share the same periods).

        -   _Split_

            Displays multiple periods side by side for comparison. Supports up to 12 periods
            (including multi-period presets) and can only be combined with other split layers (they
            will all share the same periods).

    -   After selecting a display mode, choose how to define the period(s):

        -   **Choose from presets** - _Available for all display modes. If you selected Single, you
            will also see_ Define start–end dates _as an alternative._ You can combine one or more
            relative and fixed periods.

            -   _Relative period_

                Select **Relative periods**, then the **Period type** (**Years**, **Months**, etc.)
                and choose one or more relative periods, such as **This year** and **Last year** or
                **Last 12 months**.

                A **default relative period for analysis** can be set in the **Systems Settings**
                app.

            -   _Fixed period_

                Select **Fixed periods**, then choose the **Period type** (**Yearly**, **Monthly**,
                etc.) and choose one or more fixed periods, such as **2024** or **January 2025** and
                **Febuary 2025**.

        -   **Define start - end dates** - _Available only when the Single display mode is
            selected._ Specify exact start and end dates. Both dates are inclusive and will be
            reflected in the outputs.

3.  In the **Org Units** tab:

    ![](../resources/images/maps_thematic_layer_dialog_ORG_UNITS.png)

    -   Select the organisation units you want to include in the layer. It is possible to select
        either

        -   One or more specific organisation units, organisation unit levels in the hierarchy,
            organisation unit groups, or

        -   A relative level in the organisation unit hierarchy, with respect to the user. By
            selecting a **User organisation unit** the map data will appear differently for users at
            different levels in the organisation unit hierarchy.

    -   **Use associated geometry**: This dropdown will only show if there are any additional
        geometry available for your organisation units. This is typically used to show facility
        catchment areas.

4.  In the **Filter** tab:

    ![](../resources/images/maps_thematic_layer_dialog_FILTER.png)

    -   Click **Add Filter** and select an available data item to add a new filter to the data set.

        -   Select a data dimension from the dropdown box. You can reduce the number of dimensions
            shown by using the search field. Click on the name to select a dimension.

        -   When a dimension is selected you get a second dropdown with dimension items. Check the
            items you want to include in the filter.

        Multiple filters may be added. Click the trash button on the right of the filter to remove
        it.

5.  In the **Style** tab:

    ![](../resources/images/maps_thematic_layer_dialog_STYLE.png)

    -   Select either **Choropleth** or **Bubble map**.

        -   Choropleth will assign a color to each org unit shape according to the data value. This
            is the recommended technique if the data is normalised (per capita).

        -   Bubble map will show data values as proportional circles. Use this technique if the data
            is not normalised (absolute numbers). The circles are placed in the center of each org
            unit.

    -   Set the **Low radius** and **High radius** for the proportional circles or the point
        facilities. The circles will be scaled between low and high radius according to the data
        value. The radius needs to be between 0 and 50 px.

    -   **Show labels**: Allows org unit names and values to be shown on the layer. Select between
        "Name", "Name and value" and "Value" only. Font size, weight, style and color can also be
        modified.

    -   **Show no data**: By default org units with missing data values will not show on the map.
        Check this box if you want to show them with a color. Click the color to change it.

    -   Select the legend type:

        -   **Automatic color legend**: the application will create a legend for you based on what
            classification method, number of classes and the color scale you select. Set
            **Classification** to either:

            -   Equal intervals

                the range of each interval will be (highest data value - lowest data value / number
                of classes)

            -   Equal counts

                the legend creator will try to distribute the organisation units evenly.

        -   **Predefined color legend**: Select between the predefined legends.

        -   **Single color legend**: Select the color of the bubbles or circles. Only available for
            bubble maps.

6.  Click **Add layer**.

### Modify a thematic layer

1.  In the layer panel, click the edit (pencil) icon on the thematic layer card.

2.  Modify the setting on any of the tabs as desired.

3.  Click **Update layer**.

### Filter values in a thematic layer

Thematic layers have a **Show/hide data table** option that can be toggled on or off from the
thematic layer card.

![](../resources/images/maps_thematic_layer_data_table.png)

The data table displays the data forming the thematic layer.

-   clicking on a up/down arrow button will sort the table based on that column; toggling between
    ascending and descending.

-   entering text or expressions into the filter fields below the titles will apply those filters to
    the data, and the display will adjust according to the filter. The filters are applied as
    follows:

    -   NAME

        filter by name containing the given text

    -   VALUE

        filter values by given numbers and/or ranges using `>` (greater than), `<` (less than), `>=`
        (greater than or equal), or `<=` (less than or equal). Use `,` for OR and `&` for AND logic,
        for example: `2,>3&<8` matches the value 2, or any value greater than 3 and less than 8.

    -   LEGEND

        filter by legend containing the given text

    -   RANGE

        filter by ranges containing the given text

    -   LEVEL

        filter level by numbers and/or ranges, using the same operators as VALUE, for example:
        `2,>3&<8`

    -   PARENT

        filter by parent names containing the given text

    -   ID

        filter by IDs containing the given text

    -   TYPE

        filter by GIS display types containing the given text

    -   COLOR

        filter by color names containing the given text

> **Note**
>
> Data table filters are temporary and are not saved with the map layers as part of the saved map.

### Search for an organisation unit

The NAME filter field in the data table provides an effective way of searching for individual
organisation units.

### Open organisation unit profile

You can open the [organisation unit profile](#using_maps_org_unit_profile) in three ways:

1. Click on any of the organisasjon units shown on the map, and click the **View profile** button in
   the popup.

2. Right-click one of the organisation units on the map, and select **View profile** from the menu.

3. Click on an organisation unit row in the **data table**.

### Navigate between organisation hierarchies

When there are visible organisation units on the map, you can easily navigate up and down in the
hierarchy without using the level/parent user interface.

1.  Right-click one of the organisation units.

2.  Select **Drill up one level** or **Drill down one level**.

    The drill down option is disabled if you are on the lowest level or if there are no coordinates
    available on the level below. Likewise the drill up option is disabled from the highest level.

### Remove thematic layer

To clear all data in a thematic layer:

1.  In the layer card to the left, click the _more actions_ (three dots) icon and then on **Remove
    layer**.

    The layer is removed from the current map.
