# Original campaign icons

Full-resolution originals of `public/icons/campaigns/`, kept before those files
were downscaled to the size they are actually rendered at (`CampaignIcon` draws
them at 1.3em-1.7em, so 64px tall covers 3x DPR).

They live here rather than under `public/` on purpose: anything in `public/` is
copied verbatim into the production build, which would put all 3.5 MB back into
every deploy and undo the reason for shrinking them.

Regenerate the shipped icons from these with `scripts/shrink-icons.js`.
