"use server"

import {revalidatePath} from "next/cache";
import {scrapeAmazonProduct} from "@/lib/scraper";
import {connectToDB} from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import {getAveragePrice, getHighestPrice, getLowestPrice} from "@/lib/utils";

export async function scrapeAndStoreProduct(productUrl: string) {
    if(!productUrl) return;

    try {
        connectToDB();

        const scrapedProduct = await scrapeAmazonProduct(productUrl);

        if(!scrapedProduct) return;

        let product = scrapedProduct;

        const existingProduct = await Product.findOne({ url: scrapedProduct.url });

        if(existingProduct) {
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                {
                    prices: scrapedProduct.currentPrice,
                    date: new Date(),
                }
            ]

            // console.log (updatedPriceHistory)

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }

            console.log(product.priceHistory);
        }

        const newProduct = await Product.findOneAndUpdate(
            { url: scrapedProduct.url },
            product,
            { upsert: true, new: true }
        );

        revalidatePath(`/products/${newProduct._id}`);
    } catch (error: any) {
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}

export async function getProductById(productId : string) {
    try {
        connectToDB();

        const product = await Product.findOne({_id: productId});

        if (!product) return null;

        return product;
    } catch (error) {
        console.log (error);
    }
}

export async function getAllProducts() {
    try {
        connectToDB();

        const products = await Product.find();

        return products;
    } catch (error) {
        console.log (error);
    }
}

export async function getSimilarProducts(productId: string) {
    try {
        connectToDB();

        const currProduct = await Product.findById(productId);

        if (!currProduct) return null;

        const similarProducts = await Product.find({
            _id: {$ne: productId},
        }).limit(3);

        return similarProducts;
    } catch (error) {
        console.log (error);
    }
}