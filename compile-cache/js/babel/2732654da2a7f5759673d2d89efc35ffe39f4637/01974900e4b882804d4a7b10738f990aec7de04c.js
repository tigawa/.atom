'use babel';

const fs = require('fs-plus');
const git = require('../git');
const notifier = require('../notifier');
const BranchListView = require('../views/branch-list-view');

module.exports = (repo, options = { remote: false }) => {
  const args = options.remote ? ['branch', '-r', '--no-color'] : ['branch', '--no-color'];
  return git.cmd(args, { cwd: repo.getWorkingDirectory() }).then(data => {
    return new BranchListView(data, ({ name }) => {
      const branch = name;
      git.cmd(['checkout'].concat(branch), { cwd: repo.getWorkingDirectory() }).then(message => {
        notifier.addSuccess(message);
        atom.workspace.getTextEditors().forEach(editor => {
          try {
            const path = editor.getPath();
            console.log(`Git-plus: editor.getPath() returned '${path}'`);
            if (path && path.toString) {
              fs.exists(path.toString(), exists => {
                if (!exists) editor.destroy();
              });
            }
          } catch (error) {
            notifier.addWarning("There was an error closing windows for non-existing files after the checkout. Please check the dev console.");
            console.info("Git-plus: please take a screenshot of what has been printed in the console and add it to the issue on github at https://github.com/akonwi/git-plus/issues/139", error);
          }
        });
        git.refresh(repo);
      }).catch(notifier.addError);
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdpdC1jaGVja291dC1icmFuY2guanMiXSwibmFtZXMiOlsiZnMiLCJyZXF1aXJlIiwiZ2l0Iiwibm90aWZpZXIiLCJCcmFuY2hMaXN0VmlldyIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwib3B0aW9ucyIsInJlbW90ZSIsImFyZ3MiLCJjbWQiLCJjd2QiLCJnZXRXb3JraW5nRGlyZWN0b3J5IiwidGhlbiIsImRhdGEiLCJuYW1lIiwiYnJhbmNoIiwiY29uY2F0IiwibWVzc2FnZSIsImFkZFN1Y2Nlc3MiLCJhdG9tIiwid29ya3NwYWNlIiwiZ2V0VGV4dEVkaXRvcnMiLCJmb3JFYWNoIiwiZWRpdG9yIiwicGF0aCIsImdldFBhdGgiLCJjb25zb2xlIiwibG9nIiwidG9TdHJpbmciLCJleGlzdHMiLCJkZXN0cm95IiwiZXJyb3IiLCJhZGRXYXJuaW5nIiwiaW5mbyIsInJlZnJlc2giLCJjYXRjaCIsImFkZEVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxNQUFNQSxLQUFLQyxRQUFRLFNBQVIsQ0FBWDtBQUNBLE1BQU1DLE1BQU1ELFFBQVEsUUFBUixDQUFaO0FBQ0EsTUFBTUUsV0FBV0YsUUFBUSxhQUFSLENBQWpCO0FBQ0EsTUFBTUcsaUJBQWlCSCxRQUFRLDJCQUFSLENBQXZCOztBQUVBSSxPQUFPQyxPQUFQLEdBQWlCLENBQUNDLElBQUQsRUFBT0MsVUFBUSxFQUFDQyxRQUFRLEtBQVQsRUFBZixLQUFtQztBQUNsRCxRQUFNQyxPQUFPRixRQUFRQyxNQUFSLEdBQWlCLENBQUMsUUFBRCxFQUFXLElBQVgsRUFBaUIsWUFBakIsQ0FBakIsR0FBa0QsQ0FBQyxRQUFELEVBQVcsWUFBWCxDQUEvRDtBQUNBLFNBQU9QLElBQUlTLEdBQUosQ0FBUUQsSUFBUixFQUFjLEVBQUNFLEtBQUtMLEtBQUtNLG1CQUFMLEVBQU4sRUFBZCxFQUNOQyxJQURNLENBQ0RDLFFBQVE7QUFDWixXQUFPLElBQUlYLGNBQUosQ0FBbUJXLElBQW5CLEVBQXlCLENBQUMsRUFBQ0MsSUFBRCxFQUFELEtBQVk7QUFDMUMsWUFBTUMsU0FBU0QsSUFBZjtBQUNBZCxVQUFJUyxHQUFKLENBQVEsQ0FBQyxVQUFELEVBQWFPLE1BQWIsQ0FBb0JELE1BQXBCLENBQVIsRUFBcUMsRUFBQ0wsS0FBS0wsS0FBS00sbUJBQUwsRUFBTixFQUFyQyxFQUNDQyxJQURELENBQ01LLFdBQVc7QUFDZmhCLGlCQUFTaUIsVUFBVCxDQUFvQkQsT0FBcEI7QUFDQUUsYUFBS0MsU0FBTCxDQUFlQyxjQUFmLEdBQWdDQyxPQUFoQyxDQUF3Q0MsVUFBVTtBQUNoRCxjQUFJO0FBQ0Ysa0JBQU1DLE9BQU9ELE9BQU9FLE9BQVAsRUFBYjtBQUNBQyxvQkFBUUMsR0FBUixDQUFhLHdDQUF1Q0gsSUFBSyxHQUF6RDtBQUNBLGdCQUFJQSxRQUFRQSxLQUFLSSxRQUFqQixFQUEyQjtBQUN6QjlCLGlCQUFHK0IsTUFBSCxDQUFVTCxLQUFLSSxRQUFMLEVBQVYsRUFBMkJDLFVBQVU7QUFBQyxvQkFBSSxDQUFDQSxNQUFMLEVBQWFOLE9BQU9PLE9BQVA7QUFBaUIsZUFBcEU7QUFDRDtBQUNGLFdBTkQsQ0FPQSxPQUFPQyxLQUFQLEVBQWM7QUFDWjlCLHFCQUFTK0IsVUFBVCxDQUFvQiw2R0FBcEI7QUFDQU4sb0JBQVFPLElBQVIsQ0FBYSwrSkFBYixFQUE4S0YsS0FBOUs7QUFDRDtBQUNGLFNBWkQ7QUFhQS9CLFlBQUlrQyxPQUFKLENBQVk3QixJQUFaO0FBQ0QsT0FqQkQsRUFrQkM4QixLQWxCRCxDQWtCT2xDLFNBQVNtQyxRQWxCaEI7QUFtQkQsS0FyQk0sQ0FBUDtBQXNCRCxHQXhCTSxDQUFQO0FBeUJELENBM0JEIiwiZmlsZSI6ImdpdC1jaGVja291dC1icmFuY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKVxuY29uc3QgZ2l0ID0gcmVxdWlyZSgnLi4vZ2l0JylcbmNvbnN0IG5vdGlmaWVyID0gcmVxdWlyZSgnLi4vbm90aWZpZXInKVxuY29uc3QgQnJhbmNoTGlzdFZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9icmFuY2gtbGlzdC12aWV3JylcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywgb3B0aW9ucz17cmVtb3RlOiBmYWxzZX0pID0+IHtcbiAgY29uc3QgYXJncyA9IG9wdGlvbnMucmVtb3RlID8gWydicmFuY2gnLCAnLXInLCAnLS1uby1jb2xvciddIDogWydicmFuY2gnLCAnLS1uby1jb2xvciddXG4gIHJldHVybiBnaXQuY21kKGFyZ3MsIHtjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpfSlcbiAgLnRoZW4oZGF0YSA9PiB7XG4gICAgcmV0dXJuIG5ldyBCcmFuY2hMaXN0VmlldyhkYXRhLCAoe25hbWV9KSA9PiB7XG4gICAgICBjb25zdCBicmFuY2ggPSBuYW1lXG4gICAgICBnaXQuY21kKFsnY2hlY2tvdXQnXS5jb25jYXQoYnJhbmNoKSwge2N3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCl9KVxuICAgICAgLnRoZW4obWVzc2FnZSA9PiB7XG4gICAgICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MobWVzc2FnZSlcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5mb3JFYWNoKGVkaXRvciA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgR2l0LXBsdXM6IGVkaXRvci5nZXRQYXRoKCkgcmV0dXJuZWQgJyR7cGF0aH0nYClcbiAgICAgICAgICAgIGlmIChwYXRoICYmIHBhdGgudG9TdHJpbmcpIHtcbiAgICAgICAgICAgICAgZnMuZXhpc3RzKHBhdGgudG9TdHJpbmcoKSwgZXhpc3RzID0+IHtpZiAoIWV4aXN0cykgZWRpdG9yLmRlc3Ryb3koKX0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbm90aWZpZXIuYWRkV2FybmluZyhcIlRoZXJlIHdhcyBhbiBlcnJvciBjbG9zaW5nIHdpbmRvd3MgZm9yIG5vbi1leGlzdGluZyBmaWxlcyBhZnRlciB0aGUgY2hlY2tvdXQuIFBsZWFzZSBjaGVjayB0aGUgZGV2IGNvbnNvbGUuXCIpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXCJHaXQtcGx1czogcGxlYXNlIHRha2UgYSBzY3JlZW5zaG90IG9mIHdoYXQgaGFzIGJlZW4gcHJpbnRlZCBpbiB0aGUgY29uc29sZSBhbmQgYWRkIGl0IHRvIHRoZSBpc3N1ZSBvbiBnaXRodWIgYXQgaHR0cHM6Ly9naXRodWIuY29tL2Frb253aS9naXQtcGx1cy9pc3N1ZXMvMTM5XCIsIGVycm9yKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgZ2l0LnJlZnJlc2gocmVwbylcbiAgICAgIH0pXG4gICAgICAuY2F0Y2gobm90aWZpZXIuYWRkRXJyb3IpXG4gICAgfSlcbiAgfSlcbn1cbiJdfQ==