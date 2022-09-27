// skips the first n rows, then lets anything pass
export const offset = <T>(n: number) => {
    let skipped = 0;
    const logIncrement = 100;

    return (row: T) => {
        if(skipped++ < n){
            if(skipped%logIncrement === 0) {
                console.log(`Skipped ${skipped}/${n} rows`);
            }
            return null;
        }
        return row;
    };
};

// allows n rows to pass, then filters out items
export const limit = <T>(n: number) => {
    let count = 0;
    const logIncrement = 100;

    return (row: T) => {
        if(++count > n) {
            if(count%logIncrement === 0){
                console.log(`Limiting ${count} > ${n} rows`);
            }
            return null;
        }
        return row;
    };
}
