/**
 * @jest-environment jsdom
 */


import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      // expect(windowIcon).toHaveClass('active-icon')
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  describe("give when I click on the new bill button", () => {
    test("Then I should go to new bill form page", () => {
      const billsPage = BillsUI({ data: bills });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = billsPage;
      const billContainer = new Bills({
        document,
        onNavigate,
        mockStore,
       localStorage: window.localStorage
      }
      );

      const newBillTrigger = jest.fn(billContainer.handleClickNewBill);

      const newBillBtn = screen.getByTestId("btn-new-bill");

      newBillBtn.addEventListener("click", newBillTrigger);

      userEvent.click(newBillBtn);

      expect(newBillTrigger).toHaveBeenCalled();
      expect(screen.getByTestId("form-new-bill") !== undefined).toBeTruthy();
    });
  });
  describe("give When employee is on Bills page but it is loading", ()=>{
    test("I should see the loading page",()=>{
      const billsPage = BillsUI({ data: [], loading:true });
      document.body.innerHTML = billsPage;
      const loadingText = screen.getAllByText('Loading...');
      expect(loadingText).toBeTruthy();

    })

  });

  describe("give When employee is on Bills page but there is an error", ()=>{
    test("I should see the error page",()=>{
      const billsPage = BillsUI({ data: [], loading:false, error:"Error!"});
      document.body.innerHTML = billsPage;
      const errorText = screen.getAllByText('Error!');
      expect(errorText).toBeTruthy();

    })

  });

  describe("give when employee click on eye icon",()=>{
    test("then it should open a modal with the corresponding content",()=>{
      $.fn.modal = jest.fn();
      const billsPage = BillsUI({ data: bills });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = billsPage;
      const billContainer = new Bills({
        document,
        onNavigate,
        mockStore,
       localStorage: window.localStorage
      }
      );

      const iconEye = screen.getAllByTestId('icon-eye');
      const firstIconEye = iconEye[0];
      userEvent.click(firstIconEye);

      const billModal =  screen.getByTestId("modaleFile");
      const billUrl = firstIconEye.getAttribute('data-bill-url').split('?')[0];

      console.log(billModal);
      expect(billModal).toBeTruthy();
      expect(billModal.innerHTML.includes(billUrl)).toBeTruthy();
      expect($.fn.modal).toHaveBeenCalled();


    })
  });
  // test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getAllByTestId("icon-eye").length).toBe(4);
    });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

    await  mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      // window.onNavigate(ROUTES_PATH.Bills)
      // await new Promise(process.nextTick);
      document.body.innerHTML = BillsUI({error:"Erreur 404"})
      const message =  screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    // test("fetches messages from an API and fails with 500 message error", async () => {

    // await  mockStore.bills.mockImplementationOnce(() => {
    //     return {
    //       list : () =>  {
    //         return Promise.reject(new Error("Erreur 500"))
    //       }
    //     }})
      
    //   window.onNavigate(ROUTES_PATH.Bills)
    //   await new Promise(process.nextTick);
    //   const message = await screen.getByText("Erreur 500")
    //   expect(message).toBeTruthy()
    // })
  })

  })
})
});
