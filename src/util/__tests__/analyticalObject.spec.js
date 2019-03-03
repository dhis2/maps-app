import * as d2 from 'd2';
import { 
    isValidAnalyticalObject,
    getDataDimensionsFromAnalyticalObject,
    getAnalyticsNamespace, 
    getCurrentAnalyticalObject, 
    setCurrentAnalyticalObject,
    NAMESPACE, 
    CURRENT_AO_KEY 
} from '../analyticalObject';

let mockD2;
let mockNamespace;
let dataDim;
let dataItems;

describe('analytical object utils', () => {
    describe('analytical object handling', () => {
        beforeEach(() => {
            dataItems = [{
                id: 'test'
            }];
            dataDim = {
                dimension: 'dx',
                items: dataItems,
            };
        });

        it('returns true if analytic object contains one data item', () => {
            const result = isValidAnalyticalObject({
                columns: [dataDim],
            });
            expect(result).toBeTruthy();
        });

        it('returns false if analytic object is without data item', () => {
            const result = isValidAnalyticalObject({});
            expect(result).toBeFalsy();
        });

        it('returns data items from columns in analytical object', () => {
            const result = getDataDimensionsFromAnalyticalObject({
                columns: [dataDim],
            });
            expect(result).toEqual(dataItems);
        });

        it('returns data items from rows in analytical object', () => {
            const result = getDataDimensionsFromAnalyticalObject({
                rows: [dataDim],
            });
            expect(result).toEqual(dataItems);
        });

        it('returns data items from filters in analytical object', () => {
            const result = getDataDimensionsFromAnalyticalObject({
                filters: [dataDim],
            });
            expect(result).toEqual(dataItems);
        });

        it('returns empty array if no data dimensions in analytical object', () => {
            const result = getDataDimensionsFromAnalyticalObject({});
            expect(result).toEqual([]);
        });
    });

    describe('analytical object in user data store', () => {
        beforeEach(() => {
            mockNamespace = {
                get: jest.fn(),
                set: jest.fn(),
            };
            mockD2 = {
                currentUser: {
                    dataStore: {
                        has: jest.fn().mockResolvedValue(false), // false default value for test purposes
                        get: jest.fn().mockResolvedValue(mockNamespace),
                        create: jest.fn().mockResolvedValue(mockNamespace),
                    },
                },
            };
            d2.getInstance = () => Promise.resolve(mockD2);
        });

        it('retrieves and returns namespace, creates namespace if not exists', async () => {
            const result = await getAnalyticsNamespace();

            expect(mockD2.currentUser.dataStore.has).toHaveBeenCalledTimes(1);
            expect(mockD2.currentUser.dataStore.has).toBeCalledWith(NAMESPACE);
            expect(mockD2.currentUser.dataStore.get).not.toHaveBeenCalled();
            expect(mockD2.currentUser.dataStore.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockNamespace);
        });

        it('fetches analytical object from user data store', async () => {
            await getCurrentAnalyticalObject();

            expect(mockNamespace.get).toHaveBeenCalledTimes(1);
            expect(mockNamespace.get).toBeCalledWith(CURRENT_AO_KEY);
        });

        it('saves analytical object in user data store', async () => {
            const ao = {};

            await setCurrentAnalyticalObject(ao);

            expect(mockNamespace.set).toHaveBeenCalledTimes(1);
            expect(mockNamespace.set).toBeCalledWith(CURRENT_AO_KEY, ao);
        });
    });
});