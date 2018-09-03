import { getInstance as getD2 } from 'd2/lib/d2';
import { keyBy } from 'lodash/fp';

export const styleByDataItem = async (styleDataItem, method, classes, colorScale, radius, data) => {
    if (styleDataItem) { // TODO: isObject
        console.log(styleDataItem);

        if (!styleDataItem.name) {
            // TODO: Fetch data item
        } 

        const legend = {
            unit: styleDataItem.name,
        };

        // TODO: Create new dataset (immutable)
        /*
        data.forEach(
            feature =>
                (feature.properties.value =
                    feature.properties[styleDataItem.id])
        );
        */



        if (styleDataItem.valueType === 'INTEGER') { // TODO: Support more numeruc fields
            styleByNumeric(styleDataItem, method, classes, colorScale, data);
        } else if (styleDataItem.optionSet) {
            styleByOptionSet(styleDataItem, radius, data);
        }

        return {
            data: 'data',
            legend,
        }
    }

    return null;
};

export const styleByNumeric = (styleDataItem, method, classes, colorScale, radius, data) => {
    // console.log('styleByNumeric', styleDataItem, method, classes, colorScale, data);
};

export const styleByOptionSet = async (styleDataItem, radius, data) => {
    const optionSet = await loadOptionSet(styleDataItem.optionSet.id);
    const options = optionSet.options.reduce((obj, { code, id }) => { // Map option code to id
        obj[code] = id;
        return obj
    }, {});


    console.log('styleByOptionSet', name, options);

    // http://localhost:8080/api/30/optionSets/pC3N9N77UmT.json?fields=id%2CdisplayName~rename(name)%2Coptions%5Bcode%2CdisplayName~rename(name)%2Cid%5D&paging=false

    data.forEach(({ properties }) => {
        properties.value = properties[styleDataItem.id]; // TODO: Possible to get value as id?   
        properties.color = styleDataItem.optionSet.options[properties.value];

        // console.log(properties.value, properties.color);

        /*feature.properties.color =
            styleDataItem.optionSet.options[
                feature.properties.value
            ];
            */
    });
    /*
    legend.items = getCategoryLegendItems(
        styleDataItem.optionSet.options,
        eventPointRadius || EVENT_RADIUS
    );
    */







};

export const loadOptionSet = async (id) => {
    const d2 = await getD2();
    return d2.models.optionSet.get(id, {
        fields: 'displayName~rename(name),options[id,code,displayName~rename(name)]',
    });
};