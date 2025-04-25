# PR Details: Add other GIF providers

## Pull Request Overview:
**Title**: Add other GIF providers  
**PR Description**:  
This pull request, authored by **LeonardsonCC**, aims to extend the functionality of the application to support multiple GIF providers. Currently, only **Giphy** is supported, but this PR introduces the option to switch between GIF providers, specifically **Giphy** and **Tenor**.

### Related Issue:
- This PR is related to issue **#57**, which discusses adding more GIF providers.

---

## Files Changed:
- **Files changed**: 5
- **Lines added**: 92
- **Lines removed**: 10

### File Summary:

1. **Added:**
   - **Tenor Client**: A client was added to support **Tenor** as an additional GIF provider.
   - **Switching Mechanism**: A functionality was added to switch between **Giphy** and **Tenor**.

2. **Removed**:
   - Some outdated or redundant code related to the GIF provider mechanism was removed.

---

## Commits:
1. **Commit 1**: feat(provider): added tenor client (Commit ID: 2833dac)
   - Description: Adds **Tenor** client to integrate with Tenor as a GIF provider.

2. **Commit 2**: feat(provider): change between giphy or tenor (Commit ID: c21be89)
   - Description: Adds functionality to switch between **Giphy** and **Tenor** for GIF retrieval.

3. **Commit 3**: refactor(provider): folder of providers (Commit ID: 067e0f4)
   - Description: Refactors the GIF provider logic into a separate folder for better organization and modularity.

---

## Screenshots:
- **Using Tenor**:
  ![Tenor GIF Screenshot](image_placeholder) *(Replace with an actual image)*
  
- **Using Giphy**:
  ![Giphy GIF Screenshot](image_placeholder) *(Replace with an actual image)*

---

## Comments:
- **LeonardsonCC** commented on Feb 21, 2023:  
  This PR adds support for switching between **Giphy** and **Tenor** as GIF providers. The feature aims to improve the variety of available GIFs. 

---

## PR Status:
- This PR is **still a work in progress**. Only those with write access to the repository can mark the draft as ready for review.
- There are **merge conflicts** that need to be resolved before it can be merged.

---

## Merge Information:
- The branch has conflicts that need to be resolved before merging.
- Once conflicts are resolved, the changes can be cleanly merged into the **master** branch.

---

## Conclusion:
This pull request introduces the ability to use multiple GIF providers, starting with **Giphy** and **Tenor**. It improves the variety of available GIFs, which can be beneficial to the user experience. The code needs to be reviewed and conflicts resolved before it can be merged.
