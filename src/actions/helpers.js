export const errorActionCreator = (actionType) => (error) => ({
    type: actionType,
    error,
});