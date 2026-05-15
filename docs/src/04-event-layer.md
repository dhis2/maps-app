## Manage event layers { #using_maps_event_layer }

The event layer displays the geographical location of events registered in the DHIS2 tracker.
Provided that events have associated point or polygon coordinates, you can use this layer to drill
down from the aggregated data displayed in the thematic layers to the underlying individual events
or cases.

You can also display aggregated events for facilities or organisation units. You do this through a
thematic layer using event data items. This is useful when you only have the coordinates for the Org
Unit under which the events are recorded.

![](../resources/images/maps_event_layer.png)

Event layers are represented by layer _cards_ in the layer panel such as:

Along the top of the event card from left to right are:

-   A grab field to allow dragging and re-ordering layers with the mouse

-   The title and period associated with the layer

-   An arrow symbol to collapse and expand the event card

In the middle of the event card is a legend indicating the styling of the layer.

Along the bottom of the event card from left to right are:

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

### Create an event layer { #maps_create_event_layer }

To create an event layer, choose **Events** on the **Add layer** selection. This opens the Events
layer configuration dialog.

1.  In the **Data** tab:

    ![](../resources/images/maps_event_layer_dialog_DATA.png)

    -   Select a program and then select a program stage. The **Stage** field is only shown once a
        program is selected.

        If there is only one stage available for the selected program, the stage is automatically
        selected.

    -   Select a value from the **Coordinate field** to determine which positions are displayed on
        the map. By default, "Event location" is selected. You can also choose "Organisation unit
        location". Depending on the selected program, additional options may include "Tracked entity
        location", "Enrollment location", and coordinate-type/organisation-unit-type data elements
        or attributes such as "Household location"/"Referral facility". The number of events
        represented on the map may vary depending on the selected option and the availability of
        coordinates. Organisation units are represented by their centroids.

    -   By default all events with coordinates are shown on the map. Use the **Event status** field
        to only show events having one status: Active, Completed, Schedule, Overdue or Skipped.

2.  In the **Period** tab

    ![](../resources/images/maps_event_layer_dialog_PERIOD.png)

    -   Select the time span for when the events took place. You can select either a fixed period or
        a relative period.

        -   _Relative period_

            In the **Period** field, select one of the relative periods, for example **This month**
            or **Last year**.

            A **default relative period for analysis** can be set in the **Systems Settings** app.

        -   _Fixed period_

            In the **Period** field, select **Start/end dates** and fill in a start date and an end
            date.

3.  In the **Org Units** tab:

    ![](../resources/images/maps_event_layer_dialog_ORG_UNITS.png)

    -   Select the organisation units you want to include in the layer. It is possible to select
        either

        -   One or more specific organisation units, or

        -   A relative level in the organisation unit hierarchy, with respect to the user. By
            selecting a **User organisation unit** the map data will appear differently for users at
            different levels in the organisation unit hierarchy.

4.  In the **Filter** tab:

    ![](../resources/images/maps_event_layer_dialog_FILTER.png)

    -   Click ADD FILTER and select an available data item to add a new filter to the data set.

        -   For data item of type _option set_, you can select any of the options from the dropdown
            box by using the down-wards arrow or by start typing directly in the box to filter for
            options.

        -   For data item of type _number_, you can select operators like equal, not equal, greater
            than or less than.

        -   For data item of type _boolean_ (yes/no), you can check the box if the condition should
            be valid or true.

        -   For data item of type _text_ you will get two choices: **Contains** implies that the
            query will match all values which contains your search value, and **Is exact** implies
            that only values which is completely identical to your search query will be returned.

        Multiple filters may be added. Click the trash button on the right of the filter to remove
        it.

5.  In the **Style** tab:

    ![](../resources/images/maps_event_layer_dialog_STYLE.png)

    -   Select **Group events** to group nearby events (cluster), or **View all events** to display
        events individually.

    -   Select a **color** for the event or cluster points.

    -   Select the **radius** (between 1 and 20) for the events.

    -   Select **Show buffer** to display visual buffer around each event. The radius of the buffer
        can be modified here. This option is only available if you select **View all events** above.

    -   Select a **Style by data item** (data element or attribute) to colorise the events according
        to a data value. If you also select to group events, the culsters will be displayed as small
        donut charts showing the distribution of the data values. The available options vary for
        different data types:

        -   **Option sets**: Select a color for each option in an option set. You can set default
            colors for an option in the Maintenance app.

        -   **Numbers**: You can style a numeric data item in
            [the same way as thematic layers](#using_maps_thematic_layer_style) using automatic or
            predefined legends.

        -   **Booleans**: Select a color for true/yes and another for false/no.

6.  Click **Add layer**.

### Modify an event layer

1.  In the layer panel, click the edit (pencil) icon on the event layer card.

2.  Modify the setting on the DATA, PERIOD, FILTER, ORG UNIT and STYLE tabs as desired.

3.  Click **Update layer**.

### Listing and filtering events

Event layers have a **Show/hide data table** option that can be toggled on or off from the event
layer card.

![](../resources/images/maps_event_layer_data_table.png)

The data table displays the data forming the event layer.

-   clicking on the up/down arrow will sort the table based on that column; toggling between
    ascending and descending.

-   entering text or expressions into the filter fields below the titles will apply those filters to
    the data, and the display will adjust according to the filter. The filters are applied as
    follows:

    -   ID

        filter by event IDs containing the given text

    -   ORG UNIT

        filter by org unit name containing the given text

    -   EVENT TIME

        filter by event time containing the given text

    -   TYPE

        filter by GIS display types containing the given text

    -   **Style by data item**: If events are styled by a data element or attribute (e.g. gender)
        both the data value and the color can be filtered.

    -   **Display in reports**: Data elements checked to display in reports will be shown in
        separate columns (see below how to add them).

    -   Numeric data values can be filtered by given numbers, and/or ranges, for example: 2,\>3&\<8

> **Note**
>
> Data table filters are temporary and are not saved with the map layers as part of the saved map.

### Modify information in event data table and popups

If you have access to the selected program in the Maintenance app, you can modify the information
displayed in the event pop-up window.

![](../resources/images/maps_eventlayer_eventinfopopup.png)

1.  Open the **Maintenance** app.

2.  Select **Program**.

3.  Click the program you want to modify and select **(2) Assign data elements**.

4.  For every data element you want to display in the pop-up window, select corresponding **Display
    in reports**.

5.  Click **Save**.

### Download raw event layer data

The raw data for event layers can be downloaded in GeoJSON format for more advanced geo-analytics
and processing in desktop GIS software such as [QGIS](https://www.qgis.org/). The downloaded data
includes all individual events as GeoJSON features, including attributes for each data element
selected for **Display in reports**.

![](../resources/images/maps_data_download_dialog.png)

-   In the layer card to the left, click the _more actions_ (three dots) icon and then on **Download
    data**

-   Select the **ID format** to use as the key for Data Element values in the downloaded GeoJSON
    file. There are three options available:

    -   **ID** - Use the unique ID of the data element
    -   **Name** - Use the human-friendly name of the data element (translated)
    -   **Code** - Use the code of the data element

-   Select whether or not to **Use human-readable keys** for other Event attributes, such as Program
    Stage, Latitude, Longitude, Event Data, and Organization Unit ID, Name, and Code. When this
    option is **not** selected these values will be the computer-friendly ID instead of the
    human-readable (and translated) name.

-   Click the **Download** button to generate and download a GeoJSON file. The data will be
    requested from the DHIS2 server and processed by the maps application. This operation may take
    several minutes to complete.

-   Once the GeoJSON file has been downloaded it can be imported into most standard GIS software
    applications.

> Note that the downloaded data does not include style information as it is not natively supported
> by the GeoJSON format. Styles can optionally be recreated in external GIS applications using the
> attributes of each feature.

### Clear event layer

To clear all event layer data in a map:

1.  In the layer card to the left, click the _more actions_ (three dots) icon and then on **Remove
    layer**.

    The layer is removed from the current map.
