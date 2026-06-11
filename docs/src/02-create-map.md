## Create a new map { #using_maps_create_map }

When you open the Maps app, you start with an empty map canvas and the default basemap selected. If
a map is already open, start a new one using **File** > **New**. You can change the basemap at any
time from the basemap card in the layer panel (see [Basemaps](#using_maps_basemaps)).

To add a layer, click the **(+) Add layer** button in the top left. The layer selection dialog
opens:

![](../resources/images/maps_layer_selection.png)

Available layer types are:

-   [**Thematic**](#using_maps_thematic_layer): Visualize data values (indicators or data elements)
    aggregated by org unit.
-   [**Events**](#using_maps_event_layer): Display individual events from event or tracker programs.
-   [**Tracked entities**](#using_maps_tracked_entity_layer): Display tracked entities and their
    relationships on the map.
-   [**Facilities**](#using_maps_facility_layer): Display facilities as icons based on their
    coordinates.
-   [**Org units**](#using_maps_org_unit_layer): Display org unit boundaries.

In addition, several layers may be provided by [Google Earth Engine](#using_maps_gee) (such as
population, elevation, or climate indicators) and
[other external services](#using_maps_external_map_layers). Various Google Earth Engine layer
sources are available if the Google Earth Engine API key has been set up (see
[documentation](https://docs.dhis2.org/en/use/user-guides/dhis-core-version-master/configuring-the-system/system-settings.html#system_server_settings:~:text=com/analytics.-,Google%20Maps%20API%20key,-Defines%20the%20API)).

> **Note**
>
> The [**Maps app administrator**](#maps_app_administrator) can:
>
> -   Select the sources for Google Earth Engine layers available to other users via the **Manage
>     available layer sources** button.
> -   Add external layer sources in the Maintenance app.
