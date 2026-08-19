(function (global) {
    function deepCopy(value) {
        if (value === null || typeof value !== 'object') {
            return value;
        }

        if (Array.isArray(value)) {
            return value.map(function (item) {
                return deepCopy(item);
            });
        }

        if (value instanceof Date) {
            return new Date(value.getTime());
        }

        if (value instanceof RegExp) {
            return new RegExp(value.source, value.flags);
        }

        var copy = Object.create(Object.getPrototypeOf(value));
        Object.keys(value).forEach(function (key) {
            copy[key] = deepCopy(value[key]);
        });
        return copy;
    }

    global.deepCopy = deepCopy;
})(window);
