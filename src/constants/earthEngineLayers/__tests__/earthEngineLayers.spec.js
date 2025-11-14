import Ajv from 'ajv'
import earthEngineLayers from '../index.js'

const configSchema = {
    type: 'object',
    required: [
        'layer',
        'layerId',
        'datasetId',
        'format',
        'img',
        'name',
        'description',
        'source',
        'sourceUrl',
        'unit',
        'opacity',
    ],
    properties: {
        layer: {
            type: 'string',
            enum: ['earthEngine'],
        },
        legacy: { type: 'boolean' },
        layerId: { type: 'string' },
        datasetId: { type: 'string' },
        groupping: {
            type: 'object',
            required: ['img', 'groupId', 'groupType', 'groupName'],
            properties: {
                img: { type: 'string' },
                groupId: {
                    type: 'string',
                    enum: [
                        'heat',
                        'population',
                        'precipitation',
                        'temperature',
                        'vegetation',
                    ],
                },
                groupType: {
                    type: 'string',
                    enum: ['data', 'period'],
                },
                groupName: { type: 'string' },
                groupExcludeOnSwitch: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: [
                            'band',
                            'aggregationType',
                            'period',
                            'rows',
                            'areaRadius',
                            'style',
                        ],
                    },
                },
                groupMatchOnSwitch: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['periodType'],
                    },
                },
                subGroupid: { type: 'string' },
                subGroupType: {
                    type: 'string',
                    enum: ['data', 'period'],
                },
                subGroupName: { type: 'string' },
                subGroupExcludeOnSwitch: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: [
                            'band',
                            'aggregationType',
                            'period',
                            'rows',
                            'areaRadius',
                            'style',
                        ],
                    },
                },
            },
        },
        format: {
            type: 'string',
            enum: ['Image', 'ImageCollection', 'FeatureCollection'],
        },
        img: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        notice: { type: 'string' },
        error: { type: 'string' },
        source: { type: 'string' },
        sourceUrl: { type: 'string' },
        unit: { type: 'string' },
        resolution: {
            type: 'object',
            required: ['spatial', 'temporal', 'temporalCoverage'],
            properties: {
                spatial: { type: 'string' },
                temporal: { type: 'string' },
                temporalCoverage: { type: 'string' },
            },
        },
        aggregations: {
            type: 'array',
            items: {
                type: 'string',
                enum: [
                    'count',
                    'min',
                    'max',
                    'mean',
                    'median',
                    'sum',
                    'stdDev',
                    'variance',
                ],
            },
            minItems: 1,
        },
        defaultAggregations: {
            type: ['string', 'array'],
            items: {
                type: 'string',
                enum: [
                    'count',
                    'min',
                    'max',
                    'mean',
                    'median',
                    'sum',
                    'stdDev',
                    'variance',
                ],
            },
            minItems: 1,
        },
        unmaskAggregation: { type: 'boolean' },
        periodType: {
            type: 'string',
            enum: [
                'BY_YEAR',
                'YEARLY',
                'EE_MONTHLY',
                'EE_MONTHLY_WEIGHTED',
                'EE_WEEKLY',
                'EE_WEEKLY_WEIGHTED',
                'EE_DAILY',
            ],
        },
        filters: {
            type: 'array',
            items: {
                type: 'object',
                required: ['type', 'arguments'],
                properties: {
                    type: { type: 'string' },
                    arguments: {
                        type: 'array',
                        items: { type: 'string' },
                        minItems: 1,
                    },
                },
            },
            minItems: 1,
        },
        band: { type: 'string' },
        bands: {
            type: 'object',
            required: ['label', 'multiple', 'list'],
            properties: {
                label: { type: 'string' },
                multiple: { type: 'boolean' },
                default: { type: 'string' },
                list: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'name'],
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                        },
                    },
                    minItems: 1,
                },
            },
        },
        methods: {
            type: ['array', 'object'],
            items: {
                type: 'object',
                required: ['name', 'arguments'],
                properties: {
                    name: {
                        type: 'string',
                        enum: ['multiply', 'toFloat', 'subtract'],
                    },
                    arguments: { type: 'array' },
                },
            },
            minItems: 1,
            properties: {
                multiply: {
                    type: 'array',
                    items: { type: 'number' },
                },
            },
        },
        style: {
            type: ['array', 'object'],
            items: {
                type: 'object',
                required: ['value', 'name', 'color'],
                properties: {
                    value: { type: 'number' },
                    name: { type: 'string' },
                    color: { type: 'string' },
                },
            },
            minItems: 1,
            properties: {
                color: { type: 'string' },
                strokeWidth: { type: 'number' },
                min: { type: 'number' },
                max: { type: 'number' },
                palette: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1,
                },
            },
        },
        popup: { type: 'string' },
        maskOperator: { type: 'string', enum: ['gte', 'gt'] },
        opacity: { type: 'number' },
        mosaic: { type: 'boolean' },
        tileScale: { type: 'number' },
    },
}

const ajv = new Ajv()
const validateConfig = (config) => {
    const validate = ajv.compile(configSchema)
    const valid = validate(config)
    if (!valid) {
        throw new Error(
            JSON.stringify(
                { config: config.layerId, errors: validate.errors },
                null,
                2
            )
        )
    }
    return true
}

describe.each(earthEngineLayers())('GEE config validation', (config) => {
    test(`config '${config.layerId}' is well-formed`, () => {
        validateConfig(config)
    })
})
