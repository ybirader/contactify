import { debounce } from "./helpers.js";
import { ContactList } from "./model.js";
import {
  ContactListView,
  AddContactFormView,
  EditContactFormView,
} from "./view.js";

class App extends EventTarget {
  constructor() {
    super();

    this.configHandlebars();

    this.contactList = new ContactList();
    this.contactListView = new ContactListView(this.contactList);
    this.addContactFormView = new AddContactFormView();
    this.editContactFormView = new EditContactFormView();
    this.app = document.getElementById("app");
    this.handleSearchInput = debounce(200, this.handleSearchInput.bind(this));

    this.subscribeToEvents();
    this.bindEvents();

    this.currentView = this.contactListView;
  }

  renderApp() {
    this.renderAppView();

    this.contactList.addChangeListener(() => this.renderAppView());
  }

  renderAppView() {
    Promise.resolve(this.currentView.render()).then((content) => {
      this.app.textContent = "";
      this.app.append(content);
    });
  }

  subscribeToEvents() {
    this.contactListView.addEventObserver(this);
    this.addContactFormView.addEventObserver(this);
    this.editContactFormView.addEventObserver(this);
  }

  bindEvents() {
    const delegatedEvents = {
      showAddContactForm: this.showAddContactForm,
      showEditContactForm: this.showEditContactForm,
      deleteContact: this.deleteContact,
      submitAddContactForm: this.submitAddContactForm,
      submitEditContactForm: this.submitEditContactForm,
      cancelForm: this.hideForm,
      searchQuery: this.handleSearchInput,
      tagFilter: this.handleSearchInput,
    };

    Object.keys(delegatedEvents).forEach((eventType) => {
      this.addEventListener(eventType, delegatedEvents[eventType].bind(this));
    });
  }

  showAddContactForm() {
    this.currentView = this.addContactFormView;
    this.renderAppView();
  }

  hideForm() {
    this.currentView = this.contactListView;
    this.renderAppView();
  }

  submitAddContactForm(event) {
    const delegatedEvent = this.getDelegatedEvent(event);
    delegatedEvent.preventDefault();

    const addContactForm = delegatedEvent.currentTarget;

    this.contactList.add(this.formEntries(addContactForm));

    addContactForm.reset();
  }

  submitEditContactForm(event) {
    const delegatedEvent = this.getDelegatedEvent(event);
    delegatedEvent.preventDefault();

    const editContactForm = delegatedEvent.currentTarget;
    const contactID = delegatedEvent.submitter.dataset.id;

    this.contactList.update(contactID, this.formEntries(editContactForm));

    editContactForm.reset();
  }

  deleteContact(event) {
    let contactID = this.getDelegatedEvent(event).target.dataset.id;
    let toDelete = confirm("Do you want to delete this contact?");
    if (toDelete) {
      this.contactList.delete(contactID);
    }
  }

  showEditContactForm(event) {
    let contactID = this.getDelegatedEvent(event).target.dataset.id;

    this.contactList.get(contactID).then((contact) => {
      this.editContactFormView.contact = contact;
      this.currentView = this.editContactFormView;
      this.renderAppView();
    });
  }

  formEntries(form) {
    let formData = Object.fromEntries(new FormData(form));
    formData.tags ||= null;

    return formData;
  }

  getDelegatedEvent(event) {
    return event.detail;
  }

  handleSearchInput() {
    let query = document.querySelector(".primary-input").value;
    let selectedTag = document.querySelector(".tag-filter").value;

    this.filterBy(query, selectedTag).then((contacts) => {
      this.contactListView.query = query;
      this.contactListView.selectedTag = selectedTag;
      this.contactListView.contacts = contacts;
      this.contactListView.renderPartial();
    });
  }

  filterBy(query, tag) {
    return this.contactList.getAll().then((contacts) => {
      return contacts.filter(({ full_name, tags }) => {
        return (
          this.hasMatchingFullName(query, full_name) &&
          this.hasMatchingTag(tag, tags)
        );
      });
    });
  }

  hasMatchingFullName(query, fullName) {
    return fullName.toLowerCase().startsWith(query.toLowerCase());
  }

  hasMatchingTag(tag, tags) {
    return (
      tag === "" || (tag && tags?.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  // eslint-disable-next-line max-lines-per-function
  configHandlebars() {
    Handlebars.registerPartial(
      "contact-partial",
      Handlebars.templates["contact_partial"]
    );

    Handlebars.registerPartial(
      "search-partial",
      Handlebars.templates["search_partial"]
    );

    Handlebars.registerHelper("isEmpty", function (collection) {
      return collection.length === 0;
    });

    Handlebars.registerHelper("split", function (string) {
      return string.split(",");
    });

    Handlebars.registerHelper("extractUniqueTags", function (contacts) {
      let tags = contacts.flatMap(({ tags }) => tags.split(","));

      return [...new Set(tags)];
    });
  }
}

let app = new App();
app.renderApp();
