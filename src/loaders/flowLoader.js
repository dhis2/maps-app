const flowLoader = async layer => {
    return {
        ...layer,
        name: 'Flows',
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default flowLoader;
