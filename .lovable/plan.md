# Reorder stats cards and add Album Reviews card

## New card order (homepage "Site Statistics" grid, 2 columns on tablet/desktop)

```text
[ Rappers      ] [ Rankings      ]
[ Skill Ratings] [ Slick Talk    ]
[ Album Reviews] (new)
       [ Members (centered, bottom) ]
[ All Analytics button ]
```

- Slick Talk moves to the 4th spot, sitting beside Skill Ratings as a normal-width card (no longer centered alone).
- New Album Reviews card goes 5th.
- Members moves to the bottom, taking over the centered full-row style Slick Talk used to have.

Note: with 6 cards in 2 columns, Album Reviews would sit alone in its row next to an empty space. To keep the layout balanced, Album Reviews and Members will share the final row instead, unless you want Members alone and centered beneath it.

## Album Reviews card

- Same style as the other cards (black, gold border, icon + title).
- Big number: total count of published official album reviews.
- Below: the latest review — album cover, album title, artist name, and its Spit Hierarchy score (e.g. 4.5/5), linking to the review article.
- Only reviews whose article is published (and not scheduled for the future) are counted and shown.
- If none exist, shows "No reviews yet".

## Technical details

- File: `src/components/StatsOverviewRedesigned.tsx` only.
- Add to fetchStats phase 2: query `album_reviews` joined with `blog_posts!inner(slug, status, published_at)` and `albums(title, cover_art_url, cached_cover_url, rapper_albums(rappers(name)))`, filtered to `blog_posts.status = 'published'` and `published_at <= now`, ordered by `blog_posts.published_at desc`; separate head count query with the same filter.
- Move JSX blocks; drop `md:col-span-2 md:max-w-xl md:mx-auto` from Slick Talk.
