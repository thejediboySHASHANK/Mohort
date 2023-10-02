"use client"

import React, {FormEvent, useState} from 'react'

const SearchBar = () => {
    const [searchPrompt, setSearchPrompt] = useState('')
    const [loading, setIsLoading] = useState(false)
    const isValidAmazonProductURL = (url: String) => {
        try {
            const parsedURL = new URL(url)
            const hostname = parsedURL.hostname

            if(
                hostname.includes('amazon.com') ||
                hostname.includes('amazon.') ||
                hostname.endsWith('amazon')
            ) {
                return true
            }
        } catch (error) {
            return false
        }
        return false
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const isValidLink = isValidAmazonProductURL(searchPrompt)

        if (!isValidLink) return alert('Please provide a valid Amazon link')

        try {
            setIsLoading(true)

            //Scrape the product page

        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <form
            className="flex flex-wrap gap-4 mt-12"
            onSubmit={handleSubmit}
        >
            <input
                type="text"
                value={searchPrompt}
                onChange={(ev) => setSearchPrompt(ev.target.value)}
                placeholder="Enter product link"
                className="searchbar-input"
            />

            <button
                type="submit"
                className="searchbar-btn"
                disabled={searchPrompt === ''}
            >
                {loading ? 'Searching...' : 'Search'}
            </button>
        </form>
    )
}
export default SearchBar
