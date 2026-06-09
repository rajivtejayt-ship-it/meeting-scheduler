# Bugfix Requirements Document

## Introduction

This document addresses 404 errors occurring when users navigate to meeting booking pages after creating meeting types in the deployed Next.js meeting scheduler application. The primary issue is that the "View Page" link in meeting type cards opens in a new tab using `target="_blank"`, which causes routing and authentication issues in the Next.js application, resulting in 404 errors. This bugfix ensures all navigation happens within the same tab to maintain proper routing context and session state.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user clicks the "View Page" link on a meeting type card THEN the system opens the booking page in a new browser tab with `target="_blank"`

1.2 WHEN the booking page opens in a new tab THEN the system returns a 404 error due to lost routing context or authentication state

1.3 WHEN navigation occurs via links with `target="_blank"` THEN the system fails to maintain proper Next.js routing and session continuity

### Expected Behavior (Correct)

2.1 WHEN a user clicks the "View Page" link on a meeting type card THEN the system SHALL navigate to the booking page in the same tab without `target="_blank"`

2.2 WHEN the booking page is accessed via same-tab navigation THEN the system SHALL successfully load the page without 404 errors

2.3 WHEN any navigation occurs within the application THEN the system SHALL maintain proper routing context and authentication state by staying in the same tab

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user copies the booking link using the "Copy Link" button THEN the system SHALL CONTINUE TO copy the correct booking URL to the clipboard

3.2 WHEN a user navigates using the navbar links (Dashboard, Availability) THEN the system SHALL CONTINUE TO work correctly in the same tab

3.3 WHEN a user proceeds through the booking flow (calendar → confirm → success) THEN the system SHALL CONTINUE TO navigate correctly in the same tab

3.4 WHEN a user is signed in and accesses dashboard features THEN the system SHALL CONTINUE TO display meeting types and their details correctly

3.5 WHEN a booking page is accessed with a valid meeting type ID THEN the system SHALL CONTINUE TO display the booking calendar and time slots correctly
