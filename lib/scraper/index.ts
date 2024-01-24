import axios from "axios";
import * as cheerio from 'cheerio'
import {totalmem} from "os";
import {extractCurrency, extractPrice} from "@/lib/utils";

export async function scrapeAmazonProduct(url: string) {
    if (!url) return;



    // BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io'
    }

    try {
        //Fetch the product page
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);

        //Extract the product title
        const title = $(`#productTitle`).text().trim();
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.a-price.a-text-price')
        );

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')

        )

        const outOfStock = $('#availability span').text().toLowerCase() === 'currently unavailable';

        const images =
            $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') || '{}';

        const ImageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'))

        console.log({title, currentPrice, originalPrice, outOfStock, ImageUrls});
    } catch (error : any) {
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
}
