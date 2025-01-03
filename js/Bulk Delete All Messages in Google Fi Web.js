/**
 * Custom JavaScript to bulk delete all messages in the Google Fi Web App.
 * Paste this script into the JavaScript console of your browser while on the
 * Google Fi messages page, and it will automatically delete all conversations.
 *
 * NOTE: This script is for personal use only. Use it responsibly.
 */

// Function to simulate clicking the menu button and delete option for a single conversation
async function deleteConversation(conversationItem) {
  try {
    // Step 1: Locate and click the menu button for the conversation
    const menuButton = conversationItem.querySelector("button[data-e2e-conversation-list-item-menu]");
    if (!menuButton) {
      console.warn("Menu button not found for a conversation. Skipping.");
      return;
    }
    menuButton.click();

    // Step 2: Wait for the menu to appear
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 3: Locate and click the "Delete" option in the menu
    const deleteButton = Array.from(document.querySelectorAll("button")).find((button) =>
      button.innerHTML.includes('<span class="mat-mdc-menu-item-text">Delete</span>')
    );
    if (!deleteButton) {
      console.warn("Delete button not found in menu. Skipping.");
      return;
    }
    deleteButton.click();

    // Step 4: Wait for the "Confirm Delete" dialog to appear
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 5: Locate and click the "Confirm Delete" button in the dialog
    const confirmButton = Array.from(document.querySelectorAll("button")).find((button) =>
      button.innerHTML.includes('<span class="mdc-button__label"> Delete </span>')
    );
    if (!confirmButton) {
      console.warn("Confirm button not found in dialog. Skipping.");
      return;
    }
    confirmButton.click();

    console.log("Conversation deleted successfully.");
  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
}

// Function to iterate through all conversations and delete them one by one
async function deleteAllConversations() {
  while (true) {
    // Step 1: Get a list of all visible conversations on the page
    const conversations = document.querySelectorAll("mws-conversation-list-item");
    if (conversations.length === 0) {
      console.log("No more conversations to delete.");
      break; // Exit the loop when no conversations are left
    }

    console.log(`Found ${conversations.length} conversations. Starting deletion loop.`);

    // Step 2: Loop through each conversation and delete it
    for (let i = 0; i < conversations.length; i++) {
      console.log(`Deleting conversation ${i + 1} of ${conversations.length}`);
      await deleteConversation(conversations[i]);

      // Step 3: Wait between deletions to avoid overwhelming the UI
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Step 4: Wait for more conversations to load dynamically, if applicable
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log("Finished deleting all conversations.");
}

// Start the deletion process
deleteAllConversations()
  .then(() => {
    console.log("Script completed successfully.");
  })
  .catch((err) => {
    console.error("Error during execution:", err);
  });