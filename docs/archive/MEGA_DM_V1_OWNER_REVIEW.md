# Mega DM v1 — owner review guide

This branch is a production candidate awaiting your review. The local preview at `http://127.0.0.1:3094/preview/mega-dm` contains **synthetic example content only**. Its editor buttons are disabled and changing Style there is not saved. It needs no login, database migration or provider call. A `127.0.0.1` address opens only on the computer running the preview server; it is not a phone URL.

## What the three controls mean

- **DM Craft** is owner-approved storytelling guidance shared by future turns: a short Core Doctrine plus a small library of optional situation-relevant cards. It does not grant facts or powers. In the real owner app, open **Main menu → DM Craft** to inspect effective versions and their history; editing creates a new immutable version, and restoring an earlier one changes only the effective pointer.
- **DM Style** is this campaign's seven choices for presentation and pacing. In the real owner app, open **Campaign → Settings → DM Style**, change one value, and explicitly save. Its revision follows that campaign's saves/timelines and applies to future turns.
- **Chat with DM** remains the feedback conversation. Inside a campaign, open **Chat with DM**, describe a desired change, review the proposed scope, then **Approve**, **Edit** or **Reject**. Campaign feedback never becomes global Craft automatically; global teaching requires your own generalized wording and explicit approval. Existing session/campaign guidance continues to work.

## Click-by-click local visual review

1. On the computer running the preview, open `http://127.0.0.1:3094/preview/mega-dm`.
2. Read **Core Doctrine**, **Return with change**, and **Version history**. The disabled editing buttons indicate this page is read-only synthetic data.
3. Scroll to **DM Style** and try the seven selectors. They show the owner controls but save nothing in this preview.
4. Switch **English / Russian** using the top buttons. Review at desktop width and a narrow phone-sized window. The same controls remain available; no horizontal scrolling is needed.
5. For real persistence later, use the authenticated owner app after its configured Supabase database has received the additive migration through the normal reviewed procedure. This sprint did **not** apply it to owner data.

## What this review can and cannot establish

The preview establishes layout, language and understandable controls. Automated disposable-database tests establish authority, pinning and rollback behavior. It cannot establish real-provider storytelling quality, hosted Supabase behavior, or real campaign content. Those require separately authorized evaluation and owner review. No live provider call is needed for this visual review.
