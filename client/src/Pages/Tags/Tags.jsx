import React from 'react'
import TagsList from './TagsList'
import './Tags.css'

const Tags = () => {
    const tagsList = [{
        id: 1,
        tagName: ".",
        tagDesc: "."
    }];


    const tagsListWithTruncation = tagsList.map(tag => ({
        ...tag,
        truncatedTagName: tag.tagName.length > 20 ? tag.tagName.substring(0, 20) + '...' : tag.tagName
    }));
    
  return (
    <div className='home-container-1'>
        <h1 className='tags-h1'>Tags</h1>
        <p className='tags-p'>A tag is a keyword or label that categorizes your post with other, similar posts.</p>
        <p className='tags-p'>Using the right tags makes it easier for others to find and comment on your posts.</p>
        <div className='tags-list-container'>
            {
                tagsListWithTruncation.map((tag) => (
                    <TagsList tag={tag} key={tag.id}/> 
                ))
            }
        </div>
    </div>
  )
}

export default Tags;