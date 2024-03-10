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
    const [price, setPrice] = useState<number>()
    const [brand, setBrand] = useState<string>()
    const [product, setProduct] = useState<string>()

    const fetchItems = useCallback(async (ids: string[]) => {
        try {
            setIsLoading(true)
            const result = await callAPI('get_items', {ids: ids});
            const newArr: IProduct[] = []
            result.forEach((e: IProduct) => {
                if (!newArr.find((elem) => e.id === elem.id)) {
                    newArr.push(e)
                }
            });
            setData(newArr);
            setIsLoading(false)
        } catch (error) {
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
            fetchData();
        }
    }, [fetchItems, page])

    const fetchFilteredData = async () => {
        try {
            setIsLoading(true)
            const result = await callAPI('filter', {price: price, brand: brand, product: product});
            fetchItems(result);
        } catch (error) {
            fetchFilteredData();
        }
    }

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

    return (
        <div>
            <p>{"страница: " + page}</p>
            <button onClick={prevButtonHandler}>Prev</button>
            <button onClick={nextButtonHandler}>Next</button>
            <div>
                <input placeholder='Price' onChange={(e) => setPrice(Number(e.target.value))} value={price} type='number' />
                <input placeholder='Brand' onChange={(e) => setBrand(e.target.value)} value={brand} />
                <input placeholder='Product' onChange={(e) => setProduct(e.target.value)} value={product} />
                <button onClick={filterApply}>Применить</button>
            </div>
            
            {data && !isLoading && (
                <div>
                    {data.map((item: IProduct) => (
                        <p key={item.id} className='product'>
                            <p className='id'>id: [{item.id}] <br /></p>
                            <strong>{item.product}</strong>
                            {item.brand == null ? '' : " " + item.brand}<br />
                            <p className='price'>{item.price + "₽"} <br /></p>
                        </p>
                    ))}
                </div>
            )}
            {isLoading && (<h1>Загрузка...</h1>)}
        </div>
    );
};

export default App;