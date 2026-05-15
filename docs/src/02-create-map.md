## Create a new map { #using_maps_create_map }

1.  In the **Apps** menu of DHIS2, click **Maps**. The **DHIS2 Maps** app opens.

2.  Click the (+) Add layer button in the top left. You are presented with the layer selection
    dialog:

    ![](../resources/images/maps_layer_selection.png)

3.  Select a layer to add to the current map. Possible options are:

    -   [Thematic](#using_maps_thematic_layer)

    -   [Events](#using_maps_event_layer)

    -   [Tracked entities](#using_maps_tracked_entity_layer)

    -   [Facilities](#using_maps_facility_layer)

    -   [Org units](#using_maps_org_unit_layer)

    In addition, several layers may be provided by [Google Earth Engine](#using_maps_gee) and
    [other external services](#using_maps_external_map_layers). Various Google Earth Engine layer
    sources are available if the Google Earth Engine API key has been set up (see
    [documentation](https://docs.dhis2.org/en/use/user-guides/dhis-core-version-master/configuring-the-system/system-settings.html#system_server_settings:~:text=com/analytics.-,Google%20Maps%20API%20key,-Defines%20the%20API)).

    > **Note**
    >
    > The [**Maps app administrator**](#maps_app_administrator) can:
    >
    > -   Select the sources for Google Earth Engine layers available to other users via the
    >     **Manage available layer sources** button.
    > -   Add external layer sources in the Maintenance app.

    Here is the list of default sources for a Google Earth Engine layer (see
    [complete list](#using_maps_gee)):

    -   Population and Population age groups

    -   Building footprints

    -   Elevation

    -   Precipitation (monthly)

    -   Temperature (monthly)

    -   Landcover

    The single default source for an external layer is:

    -   Labels overlay
