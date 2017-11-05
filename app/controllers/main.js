import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    openMail() {
      window.location.href = 'mailto:support@moof-it.be';
    },
    logout() {
      window.alert("Logout not implemented yet");
    },
    goToProfile() {
      window.alert("User profile not implemented yet");
    }
  }
});
