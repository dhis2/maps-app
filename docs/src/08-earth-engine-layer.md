## Manage Earth Engine layer { #using_maps_gee }

![](../resources/images/maps_ee_layer.png)

Google Earth Engine layers are enabled if a Google Earth Engine API key has been configured for your
system. Contact your system administrator if you need access to these layers.

The layers from Google Earth Engine let you display and aggregate external data to your organisation
units. Aggregated values can be viewed either in popups or in the data table.

![](../resources/images/maps_ee_layer_types.png)

> **Note**
>
> The [**Maps app administrator**](#maps_app_administrator) can configure available layer sources.

The following layer sources are supported (sources marked with an asterisk "\*" are available by
default):

-   **Population (group)**: Detailed population data from WorldPop. Estimates are provided annually
    and include current, historical, and projected population values. Available between 2015
    and 2030.

    -   **Population** \*: Total population count.
    -   **Population age groups** \*: Population broken down by age and gender.

-   **Building footprints** \*: The outlines of buildings derived from high-resolution satellite
    imagery. Only for sub-Saharan Africa, South and Southeast Asia, Latin America and the Caribbean.

-   **Elevation** \*: Elevation above sea level.

-   **Heat stress (group)**: Universal Thermal Climate Index (UTCI), a measure of the thermal stress
    experienced by a person in a given environment. Available from 1950.

    -   **Heat stress daily**.
    -   **Heat stress weekly** (derived from daily dataset).
    -   **Heat stress monthly** (derived from daily dataset).

-   **Humidity (group)**: Relative humidity is the the amount of water vapour present in air.
    Available from 1950.

    -   **Humidity daily**.
    -   **Humidity weekly** (derived from daily dataset).
    -   **Humidity monthly**.

-   **Precipitation (group)**: Accumulated water that falls to the surface. Combines model data with
    observations from across the world. Two sources are available:

    -   ERA5-Land. Available from 1950.
        -   **Precipitation daily**.
        -   **Precipitation weekly** (derived from daily dataset).
        -   **Precipitation monthly** \*.
    -   CHIRPS. Available from 1981.
        -   **Precipitation daily**.
        -   **Precipitation weekly** (derived from daily dataset).
        -   **Precipitation monthly** (derived from daily dataset).

-   **Temperature (group)**: Temperature at 2m above the surface. Combines model data with
    observations from across the world. Available from 1950.

    -   **Temperature daily**.
    -   **Temperature weekly** (derived from daily dataset).
    -   **Temperature monthly** \*.

-   **Land cover** \*: 17 distinct landcover types collected from satellites by NASA. Available
    yearly, between 2001 and 2022.

-   **Vegetation**: Normalized difference vegetation index (NDVI) and Enhanced Vegetation Index
    (EVI), used to quantify vegetation greenness. Collected from satellites by NASA. Available at
    16-day intervals, from 2000.
    -   **Vegetation 16-day**
    -   **Vegetation weekly** (derived from 16-day dataset).
    -   **Vegetation monthly** (derived from 16-day dataset).

### Create an Earth Engine layer

To create an Earth Engine layer, choose the desired layer from the **Add layer** selection. This
opens the layer configuration dialog.

1.  In the **Data** tab:

    ![](../resources/images/maps_ee_layer_dialog_DATA.png)

    -   Select dataset (if within a data group):

        -   For **Population** you can select either the **Population** or the **Population age
            group** dataset.

    -   Select data subset:

        -   For **Population age groups** you can select the age/gender **groups** you would like to
            include when aggregating the data.
        -   For **Temperature** or **Heat stress** you can select the **temporal aggregation
            method** you want to use (Mean, Min, Max).
        -   For **Vegetation** you can select the **index** you want to use (NDVI or EVI).

    -   Select the **spatial aggregation methods** you would like to use when calculating values for
        the selected organisation units, this will only affect results in popups and data table
        (some options might not be available depending on the layer source).

        -   **Sum**: Calculates the total number within each organisation unit. Recommended to use
            for the population layers.

        -   **Min**: Returns the minimum value in the layer unit displayed below the selection. For
            population layers it will be the minimum _people per hectare_. For elevation layer it
            will return the lowest elevation (meters above sea level).

        -   **Max**: Returns the maximum value in the layer unit. For population layers it will be
            the minimum _people per hectare_. For elevation layer it will return the highest
            elevation for each organisation unit.

        -   **Mean**: Returns the mean value in the layer unit. For population  
            layers it will be the mean _people per hectare_. For precipitation layer it will be the
            mean rainfall in millimeters across the organisation unit.

        -   **Median**: Returns the median value in the layer unit. For population layers it will be
            the median _people per hectare_. For temperature layer it will be the median °C across
            the organisation unit.

        -   **Standard deviation**: Returns the standard deviation value in the layer unit.

        -   **Variance**: Returns the variance value in the layer unit.

        -   **Special cases**:
            -   For "building footprints": **Count**: Returns the number of buildings within each
                organisation unit. Note that building counts are only available for smaller
                organisation unit areas.
            -   For "landcover": **Percentage**, **Hectare**, **Acres**: Return the area covered by
                each landcover category within each organisation in different units.

2.  In the **Period** tab

    ![](../resources/images/maps_ee_layer_dialog_PERIOD.png)

    -   Select dataset (if within a period group): Select the period type if you have multiple
        sources enabled for **Heat stress**, **Precipitation**, **Temperature** or **Vegetation**.

    -   Select the period for the data source. The available periods are set by layer source. Some
        sources are only available at a single point in time.

3.  In the **Organisation Units** tab:

    ![](../resources/images/maps_ee_layer_dialog_ORG_UNITS.png)

    -   Select the organisation units you where you want to see aggregated data values. It is
        possible to select either

        -   One or more specific organisation units, organisation unit levels in the hierarchy,
            organisation unit groups, or

        -   A relative level in the organisation unit hierarchy, with respect to the user. By
            selecting a **User organisation unit** the map data will appear differently for users at
            different levels in the organisation unit hierarchy.

    -   **Use associated geometry**: This dropdown will only show if there are any additional
        geometry available for your organisation units. This is typically used to calculate values
        for facility catchment areas.

4.  In the **Style** tab

    ![](../resources/images/maps_ee_layer_dialog_STYLE.png)

    -   Modify the parameters specific to the layer type.

    -   Adjust the legend range, steps and colors, as desired.

    -   If you select organisation units having a single point coordinate (facilities) you can set a
        radius buffer to calculate the data value within. A radius of 5000 meters will aggregate all
        values available within a 5 km distance from a facility. Buffer option is not available if
        associated geometry is used.

5.  Click **Add layer**.

Click on the map regions or facilities to see the aggregation result for that organisation unit.

### Listing of data values

Earth Engine layers have a **Show/hide data table** option that can be toggled on or off from the
layer card.

![](../resources/images/maps_ee_layer_data_table.png)

The data table displays all the aggregated values for the organisation units selected.

-   Clicking on the up/down button will sort the table based on that column; toggling between
    ascending and descending.

-   Entering text or expressions into the filter fields below the titles will apply those filters to
    the data, and the display will adjust according to the filter. The filters are applied as
    follows:

    -   NAME

        filter by name containing the given text

    -   ID

        filter by IDs containing the given text

    -   TYPE

        filter by GIS display types containing the given text

    -   AGGREGATION VALUES ("Sum" and "Mean" in the example above)

        there is one column for each of the aggregation types selected numeric data values can be
        filtered by given numbers, and/or ranges, for example: 2,\>3&\<8

> **Note**
>
> Data table filters are temporary and are not saved with the map layers.
