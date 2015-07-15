# Phonegap Boilerplate CLI (`pb`)

A simple CLI to create and update a project based on [Phonegap Boilerplate](https://github.com/dorian-marchal/phonegap-boilerplate)


### Installation

You can install `pb` via npm :

```
npm i -g phonegap-boilerplate
```


### Configuration

To use `pb`, you must create a `pb-config.json` file at the root of your project
(client and server). `pb` will automatically create this file the first time you run
a command.

```json
{
  "repository": "<git-address-of-the-phonegap-boilerplate-repo>",
  "branch": "<used-branch>"
}
```

If you want to change your configuration, you can simply run `pb reconfigure`.


### Usage

All of the following commands must be executed from the project root.

---

__Fetch the changes:__ `pb fetch`

Fetch the `pb-core` remote (equivalent of `git fetch pb-core`)

---

__Update your local boilerplate:__ `pb update` (on the `pb-core` branch)

Pulls the changes from the configured `pb-core` branch and pushes them on `origin/pb-core`.

---

__Merge boilerplate code in your project:__ `pb merge` (on the target branch)

On the branch targetted by the merge, merges `pb-core` but doesn't commit. You have to manually commit the changes after running this command.

---

__Improve Phonegap Boilerplate:__ `pb push` (on the `pb-core` branch)

If you have the permission to do so, you can improve Phonegap Boilerplate by pushing your modifications on both `pb-core (remote)` and `origin/pb-core` with the command `pb push`.
Be careful with this command (only use it if you know what you are doing).

---

__Edit your configuration:__ `pb reconfigure`

Edit the pb configuration.
