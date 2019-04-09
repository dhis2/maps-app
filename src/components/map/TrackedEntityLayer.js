import i18n from '@dhis2/d2-i18n';
import { apiFetch } from '../../util/api';
import Layer from './Layer';
import { TEI_COLOR, TEI_RADIUS } from '../../constants/layers';

const getCentroid = points => {
    const totals = points.reduce(
        (accum, point) => {
            accum[0] += point[0];
            accum[1] += point[1];
            return accum;
        },
        [0, 0]
    );
    return [totals[0] / points.length, totals[1] / points.length];
};

const fetchTEI = async (id, fieldsString) => {
    const data = await apiFetch(
        `/trackedEntityInstances/${id}?fields=${fieldsString}`
    );
    return data;
};

const geomToCentroid = (type, coords) => {
    switch (type) {
        case 'POINT':
            return JSON.parse(coords);
        case 'POLYGON':
            // TODO: Confirm multipolygon
            return getCentroid(JSON.parse(coords)[0]);
        default:
            return null;
    }
};

const makeRelationshipGeometry = ({ from, to }) => {
    const fromGeom = geomToCentroid(from.featureType, from.coordinates);
    const toGeom = geomToCentroid(to.featureType, to.coordinates);
    if (!fromGeom || !toGeom) {
        // console.error('Invalid relationship geometries', from, to);
        return null;
    }
    return {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [fromGeom, toGeom],
        },
        properties: {},
    };
};
const makeRelationshipLayer = relationships => {
    return {
        type: 'geoJson',
        data: relationships.map(makeRelationshipGeometry).filter(x => !!x),
        style: {
            color: '#000',
            weight: 1,
        },
    };
};
const getRelativeTEIRelationship = async (id, relationship) => {
    const fieldsString = '';

    const name = relationship.relationshipName,
        from = relationship.from.trackedEntityInstance.trackedEntityInstance,
        to = relationship.to.trackedEntityInstance.trackedEntityInstance;

    if (from === id) {
        return {
            name,
            direction: 'to',
            data: await fetchTEI(to, fieldsString),
        };
    } else if (to === id) {
        return {
            name,
            direction: 'from',
            data: await fetchTEI(from, fieldsString),
        };
    }

    throw new Error(
        'Unknown relationship, neither terminus matches current TEI!'
    );
};

class TrackedEntityLayer extends Layer {
    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            data,
            relationships,
            secondaryData,
            eventPointColor,
            eventPointRadius,
            areaRadius,
            editCounter,
        } = this.props;

        const { map } = this.context;
        const color = eventPointColor || TEI_COLOR;
        const radius = eventPointRadius || TEI_RADIUS;

        const config = {
            type: 'geoJson',
            data,
            style: {
                color,
                weight: 1,
                radius,
            },
            onClick: this.onEntityClick.bind(this),
        };

        if (areaRadius) {
            config.buffer = areaRadius;
            config.bufferStyle = {
                color,
                weight: 1,
                opacity: 0.2,
                fillOpacity: 0.1,
            };
        }

        // Create and add layer based on config object
        const group = map.createLayer({
            type: 'group',
            id,
            index,
            opacity,
            isVisible,
        });

        if (relationships) {
            const secondaryConfig = {
                type: 'geoJson',
                data: secondaryData,
                style: {
                    color: '#000',
                    weight: 0.5,
                    radius: radius / 2,
                },
                onClick: this.onEntityClick.bind(this),
            };

            const relationshipConfig = makeRelationshipLayer(relationships);

            group.addLayer(relationshipConfig);
            group.addLayer(secondaryConfig);
        }
        group.addLayer(config);

        this.layer = group;
        map.addLayer(this.layer);

        // Only fit map to layer bounds on first add
        if (!editCounter) {
            this.fitBounds();
        }
    }

    // Remove layer instance (both facilities and areas)
    removeLayer() {
        this.layer.off('click', this.onEventClick);
        super.removeLayer();
    }

    async onEntityClick({ feature, coordinates }) {
        const data = await fetchTEI(
            feature.id,
            'lastUpdated,attributes[displayName~rename(name),value],relationships'
        );

        const time =
            data.lastUpdated.substring(0, 10) +
            ' ' +
            data.lastUpdated.substring(11, 16);

        let content = data.attributes
            .map(
                ({ name, value }) =>
                    `<tr><th>${name}:</th><td>${value}</td></tr>`
            )
            .join('');

        const rels = await Promise.all(
            data.relationships.map(rel =>
                getRelativeTEIRelationship(feature.id, rel)
            )
        );
        content += rels
            .map(
                rel =>
                    `<tr><th>${
                        rel.name
                    }</th><td>${rel.direction.toUpperCase()} ${
                        rel.data.trackedEntityInstance
                    }</td></tr>`
            )
            .join('');

        this.context.map.openPopup(
            `<table>${content}<tr><th>${i18n.t(
                'Last updated'
            )}:</th><td>${time}</td></tr></table>`,
            coordinates
        );
    }
}

export default TrackedEntityLayer;
