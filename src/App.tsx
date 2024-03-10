/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState} from 'react';
import "./App.css"
import {IProduct} from './types/types';
import {callAPI} from './api/api';

const INITIAL_PAGE = 1;
const LIMIT = 50;

const App: React.FC = () => {
    const [data, setData] = useState<IProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(INITIAL_PAGE)
    const [filters, setFilters] = useState<{price?: number; brand?: string; product?: string}>({});

    const fetchItems = useCallback(async (ids: string[]) => {
        try {
            setIsLoading(true)
            const result = await callAPI('get_items', {ids: ids});
            const uniqueItems = result.filter((item: IProduct, index: number, self: IProduct[]) =>
                index === self.findIndex((t) => (
                    t.id === item.id
                ))
            );
            setData(uniqueItems);
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching items:', error);
            setData([]);
            fetchItems(ids);
        }
    }, [])

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            const result = await callAPI('get_ids', {offset: (page - INITIAL_PAGE) * LIMIT, limit: LIMIT});
            fetchItems(result);
        } catch (error) {
            console.error('Error fetching data:', error);
            setTimeout(() => {
                fetchData();
            }, 5000)
        }
    }, [fetchItems, page])

    const fetchFilteredData = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await callAPI('filter', filters);
            fetchItems(result);
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            setIsLoading(false);
        }
    }, [fetchItems, filters]);

    useEffect(() => {
        fetchData();
    }, [page])


    const prevButtonHandler = () => {
        if (page === INITIAL_PAGE) return
        setPage(prev => prev - 1)
    }

    const nextButtonHandler = () => {
        if (!data) return
        setPage(prev => prev + 1)
    }

    const filterApply = () => {
        fetchFilteredData();
    }

    const handleFilterChange = (key: string, value: any) => {
        setFilters({...filters, [key]: value});
    }

    return (
        <div>
            <p>{"страница: " + page}</p>
            <button onClick={prevButtonHandler}>Prev</button>
            <button onClick={nextButtonHandler}>Next</button>
            <div className='hero'>
                <input placeholder='Price' onChange={(e) => handleFilterChange('price', Number(e.target.value))} type='number' />
                <input placeholder='Brand' onChange={(e) => handleFilterChange('brand', e.target.value)} />
                <input placeholder='Product' onChange={(e) => handleFilterChange('product', e.target.value)} />
                <button onClick={filterApply}>Применить</button>
                <button onClick={() => fetchData()}>Сбросить</button>
            </div>

            {data.length > 0 && !isLoading ? (
                <div>
                    {data.map((item: IProduct) => (
                        <div key={item.id} className='product'>
                            <p className='id'>id: [{item.id}] <br /></p>
                            <strong>{item.product}</strong>
                            {item.brand ? ` ${item.brand}` : ''}<br />
                            <p className='price'>{`${item.price}₽`} <br /></p>
                        </div>
                    ))}
                </div>
            ) : (
                isLoading ? <h1>Загрузка...</h1> : <p>No data found.</p>
            )}
        </div>
    );
};

export default App;